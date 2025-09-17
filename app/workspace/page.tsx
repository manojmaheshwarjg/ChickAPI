'use client'

import React, { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface TeamMember {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'owner' | 'admin' | 'developer' | 'viewer'
  status: 'active' | 'pending' | 'inactive'
  joinedAt: Date
  lastActive: Date
  projects: string[]
  permissions: {
    canCreateProjects: boolean
    canDeleteProjects: boolean
    canManageTeam: boolean
    canViewAnalytics: boolean
    canManageIntegrations: boolean
    canManageWorkspace: boolean
  }
  stats: {
    projectsContributed: number
    workflowsCreated: number
    commentsPosted: number
    lastContribution: Date
  }
}

interface WorkspaceActivity {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  action: string
  type: 'project' | 'workflow' | 'comment' | 'member' | 'permission'
  target: string
  description: string
  timestamp: Date
  metadata?: Record<string, any>
}

interface Comment {
  id: string
  userId: string
  userName: string
  userAvatar?: string
  content: string
  target: {
    type: 'project' | 'workflow' | 'endpoint'
    id: string
    name: string
  }
  timestamp: Date
  resolved: boolean
  replies: Array<{
    id: string
    userId: string
    userName: string
    content: string
    timestamp: Date
  }>
}

const mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    avatar: '👨‍💻',
    role: 'owner',
    status: 'active',
    joinedAt: new Date('2024-01-15'),
    lastActive: new Date('2024-09-15T14:30:00Z'),
    projects: ['1', '2', '3'],
    permissions: {
      canCreateProjects: true,
      canDeleteProjects: true,
      canManageTeam: true,
      canViewAnalytics: true,
      canManageIntegrations: true,
      canManageWorkspace: true
    },
    stats: {
      projectsContributed: 12,
      workflowsCreated: 45,
      commentsPosted: 89,
      lastContribution: new Date('2024-09-15T12:00:00Z')
    }
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    avatar: '👩‍💻',
    role: 'admin',
    status: 'active',
    joinedAt: new Date('2024-02-01'),
    lastActive: new Date('2024-09-15T13:45:00Z'),
    projects: ['1', '3', '4'],
    permissions: {
      canCreateProjects: true,
      canDeleteProjects: false,
      canManageTeam: true,
      canViewAnalytics: true,
      canManageIntegrations: true,
      canManageWorkspace: false
    },
    stats: {
      projectsContributed: 8,
      workflowsCreated: 23,
      commentsPosted: 156,
      lastContribution: new Date('2024-09-15T11:30:00Z')
    }
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike.johnson@example.com',
    avatar: '👨‍🔬',
    role: 'developer',
    status: 'active',
    joinedAt: new Date('2024-03-10'),
    lastActive: new Date('2024-09-15T10:20:00Z'),
    projects: ['2', '3'],
    permissions: {
      canCreateProjects: true,
      canDeleteProjects: false,
      canManageTeam: false,
      canViewAnalytics: false,
      canManageIntegrations: false,
      canManageWorkspace: false
    },
    stats: {
      projectsContributed: 5,
      workflowsCreated: 34,
      commentsPosted: 67,
      lastContribution: new Date('2024-09-14T16:45:00Z')
    }
  },
  {
    id: '4',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@example.com',
    avatar: '👩‍🎨',
    role: 'viewer',
    status: 'pending',
    joinedAt: new Date('2024-09-10'),
    lastActive: new Date('2024-09-10T09:00:00Z'),
    projects: [],
    permissions: {
      canCreateProjects: false,
      canDeleteProjects: false,
      canManageTeam: false,
      canViewAnalytics: false,
      canManageIntegrations: false,
      canManageWorkspace: false
    },
    stats: {
      projectsContributed: 0,
      workflowsCreated: 0,
      commentsPosted: 2,
      lastContribution: new Date('2024-09-10T10:15:00Z')
    }
  }
]

const mockActivities: WorkspaceActivity[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Jane Smith',
    userAvatar: '👩‍💻',
    action: 'created',
    type: 'project',
    target: 'Payment Gateway Integration',
    description: 'Created a new project for payment processing workflows',
    timestamp: new Date('2024-09-15T14:30:00Z'),
    metadata: { projectId: '5' }
  },
  {
    id: '2',
    userId: '3',
    userName: 'Mike Johnson',
    userAvatar: '👨‍🔬',
    action: 'commented on',
    type: 'workflow',
    target: 'User Authentication Flow',
    description: 'Added feedback on the OAuth implementation approach',
    timestamp: new Date('2024-09-15T13:45:00Z'),
    metadata: { workflowId: 'w1', commentId: 'c1' }
  },
  {
    id: '3',
    userId: '1',
    userName: 'John Doe',
    userAvatar: '👨‍💻',
    action: 'updated permissions for',
    type: 'member',
    target: 'Mike Johnson',
    description: 'Granted analytics access permissions',
    timestamp: new Date('2024-09-15T12:20:00Z'),
    metadata: { targetUserId: '3' }
  }
]

const mockComments: Comment[] = [
  {
    id: '1',
    userId: '2',
    userName: 'Jane Smith',
    userAvatar: '👩‍💻',
    content: 'The OAuth flow looks good, but we should add refresh token rotation for better security.',
    target: {
      type: 'workflow',
      id: 'w1',
      name: 'User Authentication Flow'
    },
    timestamp: new Date('2024-09-15T13:45:00Z'),
    resolved: false,
    replies: [
      {
        id: 'r1',
        userId: '3',
        userName: 'Mike Johnson',
        content: 'Good point! I\'ll implement that in the next iteration.',
        timestamp: new Date('2024-09-15T14:00:00Z')
      }
    ]
  },
  {
    id: '2',
    userId: '3',
    userName: 'Mike Johnson',
    userAvatar: '👨‍🔬',
    content: 'Should we add rate limiting to the API endpoints in this project?',
    target: {
      type: 'project',
      id: '1',
      name: 'E-commerce API Suite'
    },
    timestamp: new Date('2024-09-15T11:30:00Z'),
    resolved: true,
    replies: []
  }
]

export default function WorkspacePage() {
  const router = useRouter()
  const [selectedTab, setSelectedTab] = useState<'team' | 'activity' | 'comments' | 'settings'>('team')
  const [searchQuery, setSearchQuery] = useState('')
  const [filterRole, setFilterRole] = useState<string>('all')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [showInviteModal, setShowInviteModal] = useState(false)
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null)

  const roles = ['owner', 'admin', 'developer', 'viewer']
  const statuses = ['active', 'pending', 'inactive']

  const filteredMembers = useMemo(() => {
    return mockTeamMembers.filter(member => {
      const matchesSearch = member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          member.email.toLowerCase().includes(searchQuery.toLowerCase())
      const matchesRole = filterRole === 'all' || member.role === filterRole
      const matchesStatus = filterStatus === 'all' || member.status === filterStatus
      
      return matchesSearch && matchesRole && matchesStatus
    })
  }, [searchQuery, filterRole, filterStatus])

  const getRoleText = (role: string) => {
    switch (role) {
      case 'owner': return 'OWNER'
      case 'admin': return 'ADMIN'
      case 'developer': return 'DEV'
      case 'viewer': return 'VIEW'
      default: return 'USER'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'inactive': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'owner': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'admin': return 'bg-blue-100 text-blue-800 border-blue-200'
      case 'developer': return 'bg-green-100 text-green-800 border-green-200'
      case 'viewer': return 'bg-gray-100 text-gray-800 border-gray-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getActivityType = (type: string) => {
    switch (type) {
      case 'project': return 'PROJ'
      case 'workflow': return 'FLOW'
      case 'comment': return 'COMM'
      case 'member': return 'TEAM'
      case 'permission': return 'PERM'
      default: return 'ACT'
    }
  }

  const handleInviteMember = (email: string, role: string) => {
    console.log('Inviting member:', email, 'with role:', role)
    setShowInviteModal(false)
    // In real implementation, this would send an invitation
  }

  const handleUpdateMemberRole = (memberId: string, newRole: string) => {
    console.log('Updating member role:', memberId, 'to:', newRole)
    // In real implementation, this would update the member's role
  }

  const handleRemoveMember = (memberId: string) => {
    console.log('Removing member:', memberId)
    // In real implementation, this would remove the member
  }

  const formatTimeAgo = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))
    
    if (diffInHours < 1) return 'Just now'
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays < 7) return `${diffInDays}d ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-300">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-4 mb-2">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center font-bold text-gray-700">
                  TW
                </div>
                <div>
                  <h1 className="text-3xl font-light text-gray-900 tracking-tight">
                    Team Workspace
                  </h1>
                  <p className="text-gray-600 font-medium">
                    Manage your team, collaborate on projects, and track workspace activity
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors">
                Settings
              </button>
              <button 
                onClick={() => setShowInviteModal(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-black border border-black hover:bg-gray-800 transition-colors"
              >
                Invite Member
              </button>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="px-8">
          <div className="flex items-center gap-1 border-b border-gray-300">
            {[
              { id: 'team', label: 'Team Members' },
              { id: 'activity', label: 'Activity Feed' },
              { id: 'comments', label: 'Comments' },
              { id: 'settings', label: 'Workspace Settings' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id as any)}
                className={`px-6 py-3 text-sm font-medium border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-black text-gray-900 bg-gray-50'
                    : 'border-transparent text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-8 py-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {selectedTab === 'team' && (
            <TeamMembersTab
              members={filteredMembers}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
              filterRole={filterRole}
              setFilterRole={setFilterRole}
              filterStatus={filterStatus}
              setFilterStatus={setFilterStatus}
              onUpdateRole={handleUpdateMemberRole}
              onRemoveMember={handleRemoveMember}
              getRoleText={getRoleText}
              getStatusColor={getStatusColor}
              getRoleColor={getRoleColor}
              formatTimeAgo={formatTimeAgo}
            />
          )}

          {selectedTab === 'activity' && (
            <ActivityFeedTab
              activities={mockActivities}
              getActivityType={getActivityType}
              formatTimeAgo={formatTimeAgo}
            />
          )}

          {selectedTab === 'comments' && (
            <CommentsTab
              comments={mockComments}
              formatTimeAgo={formatTimeAgo}
            />
          )}

          {selectedTab === 'settings' && (
            <WorkspaceSettingsTab />
          )}
        </div>
      </main>

      {/* Invite Member Modal */}
      {showInviteModal && (
        <InviteMemberModal
          onClose={() => setShowInviteModal(false)}
          onInvite={handleInviteMember}
        />
      )}
    </div>
  )
}

// Team Members Tab Component
function TeamMembersTab({
  members,
  searchQuery,
  setSearchQuery,
  filterRole,
  setFilterRole,
  filterStatus,
  setFilterStatus,
  onUpdateRole,
  onRemoveMember,
  getRoleText,
  getStatusColor,
  getRoleColor,
  formatTimeAgo
}: any) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search team members..."
              className="w-64 border-gray-300"
            />
          </div>
          
          <select 
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
            className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <option value="all">All Roles</option>
            <option value="owner">Owner</option>
            <option value="admin">Admin</option>
            <option value="developer">Developer</option>
            <option value="viewer">Viewer</option>
          </select>

          <select 
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-3 py-2 text-sm font-medium bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="text-sm font-medium text-gray-700">
          {members.length} members found
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {members.map((member: TeamMember) => (
          <div key={member.id} className="bg-white border border-gray-300 p-6 hover:bg-gray-50 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gray-100 flex items-center justify-center text-gray-700 font-bold">
                  {member.avatar || member.name.charAt(0)}
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">{member.name}</h3>
                  <p className="text-sm text-gray-600">{member.email}</p>
                </div>
              </div>
              
              <button className="px-2 py-1 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                ⋮
              </button>
            </div>

            <div className="flex items-center gap-2 mb-4">
              <div className={`px-2 py-1 text-xs font-medium border ${getRoleColor(member.role)}`}>
                <span className="uppercase tracking-wide">{getRoleText(member.role)}</span>
              </div>
              <div className={`px-2 py-1 text-xs font-medium border ${getStatusColor(member.status)}`}>
                <span className="uppercase tracking-wide">{member.status}</span>
              </div>
            </div>

            <div className="space-y-4 mb-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500 font-medium uppercase tracking-wide text-xs">PROJECTS</div>
                  <div className="text-lg font-light text-gray-900">{member.stats.projectsContributed}</div>
                </div>
                <div>
                  <div className="text-gray-500 font-medium uppercase tracking-wide text-xs">WORKFLOWS</div>
                  <div className="text-lg font-light text-gray-900">{member.stats.workflowsCreated}</div>
                </div>
              </div>
              <div className="text-sm text-gray-600 font-medium">
                Last active: {formatTimeAgo(member.lastActive)}
              </div>
            </div>

            {/* Key Permissions */}
            <div className="border-t border-gray-200 pt-3">
              <div className="text-xs text-gray-500 font-medium uppercase tracking-wide mb-2">KEY PERMISSIONS</div>
              <div className="flex flex-wrap gap-1">
                {member.permissions.canCreateProjects && (
                  <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-300">Create Projects</div>
                )}
                {member.permissions.canManageTeam && (
                  <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-300">Manage Team</div>
                )}
                {member.permissions.canViewAnalytics && (
                  <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-300">View Analytics</div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// Activity Feed Tab Component
function ActivityFeedTab({ activities, getActivityType, formatTimeAgo }: any) {
  return (
    <div className="space-y-6">
      <div className="bg-white border border-gray-300 p-6">
        <h2 className="text-xl font-light text-gray-900 mb-6 tracking-tight">Recent Activity</h2>
        <div className="space-y-4">
          {activities.map((activity: WorkspaceActivity) => (
            <div key={activity.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 border border-gray-200">
              <div className="w-10 h-10 bg-gray-100 flex items-center justify-center text-gray-700 font-bold text-sm flex-shrink-0">
                {activity.userAvatar || activity.userName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium border border-gray-300">
                    {getActivityType(activity.type)}
                  </div>
                  <span className="text-sm font-medium text-gray-900">
                    {activity.userName}
                  </span>
                  <span className="text-sm text-gray-600">
                    {activity.action}
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {activity.target}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{activity.description}</p>
                <div className="text-xs text-gray-500 font-medium">
                  {formatTimeAgo(activity.timestamp)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// Comments Tab Component
function CommentsTab({ comments, formatTimeAgo }: any) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900">Team Comments</h2>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {comments.filter((c: Comment) => !c.resolved).length} Open
          </Badge>
          <Badge variant="outline" className="text-xs">
            {comments.filter((c: Comment) => c.resolved).length} Resolved
          </Badge>
        </div>
      </div>

      <div className="space-y-4">
        {comments.map((comment: Comment) => (
          <Card key={comment.id} className="p-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-sm flex-shrink-0">
                {comment.userAvatar || comment.userName.charAt(0)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900">{comment.userName}</span>
                    <span className="text-sm text-gray-500">commented on</span>
                    <Badge variant="outline" className="text-xs">
                      {comment.target.type}
                    </Badge>
                    <span className="text-sm font-medium text-gray-900">{comment.target.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {comment.resolved ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-600" />
                    )}
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(comment.timestamp)}
                    </span>
                  </div>
                </div>
                
                <p className="text-gray-700 mb-3">{comment.content}</p>
                
                {comment.replies.length > 0 && (
                  <div className="border-l-2 border-gray-200 pl-4 space-y-2">
                    {comment.replies.map((reply) => (
                      <div key={reply.id} className="flex items-start gap-2">
                        <div className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-xs text-gray-600">
                          {reply.userName.charAt(0)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900">{reply.userName}</span>
                            <span className="text-xs text-gray-500">
                              {formatTimeAgo(reply.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{reply.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="flex items-center gap-2 mt-3 pt-3 border-t border-gray-100">
                  <Button variant="ghost" size="sm">
                    Reply
                  </Button>
                  {!comment.resolved && (
                    <Button variant="ghost" size="sm" className="text-green-600">
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  )
}

// Workspace Settings Tab Component
function WorkspaceSettingsTab() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* General Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">General Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Workspace Name
              </label>
              <Input defaultValue="ChickAPI Team" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea 
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
                rows={3}
                defaultValue="API development and workflow automation team workspace"
              />
            </div>
            <Button>Save Changes</Button>
          </div>
        </Card>

        {/* Security Settings */}
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Security Settings</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h4>
                <p className="text-xs text-gray-500">Require 2FA for all team members</p>
              </div>
              <Button variant="outline" size="sm">Enable</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">SSO Integration</h4>
                <p className="text-xs text-gray-500">Single sign-on with your identity provider</p>
              </div>
              <Button variant="outline" size="sm">Configure</Button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">IP Restrictions</h4>
                <p className="text-xs text-gray-500">Limit access to specific IP addresses</p>
              </div>
              <Button variant="outline" size="sm">Manage</Button>
            </div>
          </div>
        </Card>
      </div>

      {/* Integrations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { name: 'Slack', icon: '💬', description: 'Team communication', connected: true },
            { name: 'GitHub', icon: '🐙', description: 'Version control', connected: true },
            { name: 'Jira', icon: '📋', description: 'Issue tracking', connected: false }
          ].map((integration) => (
            <div key={integration.name} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{integration.icon}</span>
                <div>
                  <h4 className="font-medium text-gray-900">{integration.name}</h4>
                  <p className="text-xs text-gray-500">{integration.description}</p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                {integration.connected ? 'Configure' : 'Connect'}
              </Button>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

// Invite Member Modal Component
function InviteMemberModal({ onClose, onInvite }: { onClose: () => void; onInvite: (email: string, role: string) => void }) {
  const [email, setEmail] = useState('')
  const [role, setRole] = useState('viewer')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (email.trim()) {
      onInvite(email, role)
      setEmail('')
      setRole('viewer')
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-lg font-semibold text-gray-900">Invite Team Member</h2>
          <Button variant="ghost" onClick={onClose}>
            <XCircle className="w-5 h-5" />
          </Button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@example.com"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Role
              </label>
              <select 
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md text-sm"
              >
                <option value="viewer">Viewer - View projects and workflows</option>
                <option value="developer">Developer - Create and edit workflows</option>
                <option value="admin">Admin - Manage projects and team</option>
              </select>
            </div>
          </div>
          
          <div className="flex items-center gap-3 mt-6">
            <Button type="submit" className="flex-1">
              Send Invitation
            </Button>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}