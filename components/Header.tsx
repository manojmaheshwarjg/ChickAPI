import React from 'react'
import Link from 'next/link'
import { 
  Play, 
  Copy,
  CloudUpload,
  Settings,
  User,
  Bell,
  HelpCircle,
  Search
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface HeaderProps {
  workflowName: string
  onWorkflowNameChange?: (name: string) => void
}

export default function Header({ workflowName, onWorkflowNameChange }: HeaderProps) {
  return (
    <header className="bg-background border-b border-border px-4 py-3">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center gap-6">
          {/* Text Logo */}
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-semibold text-foreground">ChickAPI</h1>
            <div className="h-5 w-px bg-border"></div>
          </div>

          {/* Workflow Name */}
          <div className="flex items-center gap-2">
            <Input
              type="text"
              value={workflowName}
              onChange={(e) => onWorkflowNameChange?.(e.target.value)}
              className="text-base font-medium bg-transparent border-none shadow-none focus-visible:ring-0 hover:bg-muted/50 px-2 py-1 h-8 w-48"
              placeholder="Untitled Workflow"
            />
            <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground">
              <Copy className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Center Section - Environment Selector & Discovery */}
        <div className="flex items-center gap-3">
          {/* API Discovery Button */}
          <Link href="/discovery" passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <Search className="w-4 h-4" />
              API Discovery
            </Button>
          </Link>
          
          {/* Legacy Canvas Button */}
          <Link href="/legacy-canvas" passHref>
            <Button variant="outline" className="flex items-center gap-2">
              <span className="text-xs">🔧</span>
              Legacy Canvas
            </Button>
          </Link>
          
          <div className="h-5 w-px bg-border"></div>
          
          <Select defaultValue="development">
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="development">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="production">Production</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="primary">
            <Play className="w-4 h-4 mr-2" />
            Run
          </Button>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Save Status */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <CloudUpload className="w-4 h-4" />
            <span>Saved</span>
          </div>

          <div className="h-5 w-px bg-border"></div>

          {/* Action Buttons */}
          <Button variant="ghost" size="icon">
            <Bell className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <HelpCircle className="w-5 h-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-5 h-5" />
          </Button>
          
          {/* User Menu */}
          <Button variant="ghost" className="flex items-center gap-2 px-3">
            <User className="w-6 h-6" />
            <span className="text-sm font-medium">User</span>
          </Button>
        </div>
      </div>
    </header>
  )
}
