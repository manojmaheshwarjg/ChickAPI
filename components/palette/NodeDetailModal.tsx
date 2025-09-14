'use client'

import React, { useState } from 'react'
import {
  X, Play, Star, TrendingUp, Clock, Users,
  Code, BookOpen, Lightbulb, Target, Zap,
  CheckCircle, AlertCircle, Eye, Copy,
  Globe, RefreshCw, Brain, ArrowRight,
  BarChart3, Settings, TestTube, Download
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Progress } from '@/components/ui/progress'

interface NodeDetailModalProps {
  node: any // Enhanced node definition
  open: boolean
  onClose: () => void
  onUseNode: (node: any) => void
  onAddToFavorites: (nodeId: string) => void
}

export function NodeDetailModal({ node, open, onClose, onUseNode, onAddToFavorites }: NodeDetailModalProps) {
  const [selectedExample, setSelectedExample] = useState(0)
  const [activeTab, setActiveTab] = useState('overview')

  if (!node) return null

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0">
        <div className="flex h-[80vh]">
          {/* Left Panel - Main Content */}
          <div className="flex-1 flex flex-col">
            {/* Header */}
            <DialogHeader className="p-6 pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div 
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                    style={{ backgroundColor: node.color }}
                  >
                    {node.icon}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <h2 className="text-2xl font-bold">{node.name}</h2>
                      {node.premium && <Zap className="w-5 h-5 text-yellow-500" />}
                      {node.beta && <Badge variant="outline">Beta</Badge>}
                    </div>
                    <p className="text-muted-foreground mb-2">{node.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-1">
                        <Star className="w-4 h-4 fill-current text-yellow-400" />
                        <span className="font-medium">{node.analytics.rating}</span>
                        <span className="text-muted-foreground">({node.analytics.reviews} reviews)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <TrendingUp className="w-4 h-4 text-green-500" />
                        <span>{node.analytics.popularity}% popularity</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => onAddToFavorites(node.id)}>
                    <Star className="w-4 h-4 mr-2" />
                    Favorite
                  </Button>
                  <Button onClick={() => onUseNode(node)} className="gap-2">
                    <Play className="w-4 h-4" />
                    Add to Workflow
                  </Button>
                  <Button variant="ghost" size="sm" onClick={onClose}>
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </DialogHeader>

            <Separator />

            {/* Content Tabs */}
            <div className="flex-1 overflow-hidden">
              <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                <TabsList className="grid w-full grid-cols-6 mx-6 mt-4">
                  <TabsTrigger value="overview">Overview</TabsTrigger>
                  <TabsTrigger value="examples">Examples</TabsTrigger>
                  <TabsTrigger value="config">Configuration</TabsTrigger>
                  <TabsTrigger value="analytics">Analytics</TabsTrigger>
                  <TabsTrigger value="docs">Documentation</TabsTrigger>
                  <TabsTrigger value="ai">AI Insights</TabsTrigger>
                </TabsList>

                <div className="flex-1 overflow-auto px-6 pb-6">
                  <TabsContent value="overview" className="mt-4 space-y-6">
                    {/* Quick Stats */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BarChart3 className="w-5 h-5" />
                          Performance Metrics
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-4 gap-4">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">{node.analytics.successRate}%</div>
                            <div className="text-sm text-muted-foreground">Success Rate</div>
                            <Progress value={node.analytics.successRate} className="mt-2" />
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold">{node.analytics.avgResponseTime}ms</div>
                            <div className="text-sm text-muted-foreground">Avg Response Time</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600">{node.analytics.weeklyUse.toLocaleString()}</div>
                            <div className="text-sm text-muted-foreground">Weekly Usage</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-purple-600">{node.complexity}</div>
                            <div className="text-sm text-muted-foreground">Complexity</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Inputs & Outputs */}
                    <div className="grid grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ArrowRight className="w-5 h-5 rotate-180" />
                            Inputs ({node.inputs.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {node.inputs.map((input: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              <div className="w-2 h-2 rounded-full bg-blue-500 mt-2" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{input.name}</span>
                                  <Badge variant="outline" className="text-xs">{input.type}</Badge>
                                  {input.required && <Badge variant="secondary" className="text-xs">Required</Badge>}
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{input.description}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <ArrowRight className="w-5 h-5" />
                            Outputs ({node.outputs.length})
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {node.outputs.map((output: any, i: number) => (
                            <div key={i} className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                              <div className="w-2 h-2 rounded-full bg-green-500 mt-2" />
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{output.name}</span>
                                  <Badge variant="outline" className="text-xs">{output.type}</Badge>
                                </div>
                                <p className="text-sm text-muted-foreground mt-1">{output.description}</p>
                              </div>
                            </div>
                          ))}
                        </CardContent>
                      </Card>
                    </div>

                    {/* Description */}
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          About This Node
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm leading-relaxed">{node.longDescription}</p>
                        <div className="flex flex-wrap gap-2 mt-4">
                          {node.tags.map((tag: string) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="examples" className="mt-4 space-y-4">
                    <div className="flex gap-2 mb-4">
                      {node.examples.map((example: any, i: number) => (
                        <Button
                          key={i}
                          variant={selectedExample === i ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedExample(i)}
                        >
                          {example.name}
                        </Button>
                      ))}
                    </div>

                    {node.examples[selectedExample] && (
                      <Card>
                        <CardHeader>
                          <div className="flex items-start justify-between">
                            <div>
                              <CardTitle>{node.examples[selectedExample].name}</CardTitle>
                              <p className="text-muted-foreground mt-1">{node.examples[selectedExample].description}</p>
                            </div>
                            <Button size="sm" variant="outline" className="gap-2">
                              <Play className="w-4 h-4" />
                              Try Example
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Settings className="w-4 h-4" />
                              Configuration
                            </h4>
                            <div className="bg-muted rounded-lg p-3 font-mono text-sm overflow-x-auto">
                              <pre>{JSON.stringify(node.examples[selectedExample].config, null, 2)}</pre>
                            </div>
                            <Button size="sm" variant="ghost" className="mt-2 gap-2">
                              <Copy className="w-4 h-4" />
                              Copy Config
                            </Button>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2 flex items-center gap-2">
                              <Eye className="w-4 h-4" />
                              Expected Output
                            </h4>
                            <div className="bg-muted rounded-lg p-3 font-mono text-sm">
                              <pre>{node.examples[selectedExample].preview}</pre>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}
                  </TabsContent>

                  <TabsContent value="config" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle>Configuration Options</CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Detailed configuration parameters for this node
                        </p>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-8 text-muted-foreground">
                          <Settings className="w-12 h-12 mx-auto mb-4 opacity-50" />
                          <p>Configuration details will be shown here</p>
                          <p className="text-sm">Based on the node's property definitions</p>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="analytics" className="mt-4 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Usage Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">This Week</span>
                              <span className="font-medium">{node.analytics.weeklyUse.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Success Rate</span>
                              <span className="font-medium text-green-600">{node.analytics.successRate}%</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">User Rating</span>
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 fill-current text-yellow-400" />
                                <span className="font-medium">{node.analytics.rating}</span>
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="text-base">Performance</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-3">
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Avg Response Time</span>
                              <span className="font-medium">{node.analytics.avgResponseTime}ms</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Popularity Rank</span>
                              <Badge variant="secondary">{node.analytics.popularity}%</Badge>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-sm">Community Rating</span>
                              <span className="font-medium">{node.analytics.reviews} reviews</span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </TabsContent>

                  <TabsContent value="docs" className="mt-4">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <BookOpen className="w-5 h-5" />
                          Documentation
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div>
                            <h4 className="font-medium mb-2">Version</h4>
                            <p className="text-sm text-muted-foreground">{node.version} • Updated {node.lastUpdated}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Author</h4>
                            <p className="text-sm text-muted-foreground">{node.author}</p>
                          </div>
                          <div>
                            <h4 className="font-medium mb-2">Category</h4>
                            <Badge>{node.category}</Badge>
                          </div>
                          <Separator />
                          <div className="text-center py-8 text-muted-foreground">
                            <BookOpen className="w-12 h-12 mx-auto mb-4 opacity-50" />
                            <p>Full documentation coming soon</p>
                            <Button variant="outline" size="sm" className="mt-4 gap-2">
                              <Download className="w-4 h-4" />
                              Download PDF Guide
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </TabsContent>

                  <TabsContent value="ai" className="mt-4">
                    {node.aiInsights && (
                      <div className="space-y-4">
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Brain className="w-5 h-5 text-purple-500" />
                              AI-Powered Insights
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div>
                              <h4 className="font-medium mb-2 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-yellow-500" />
                                Smart Recommendations
                              </h4>
                              <div className="space-y-2">
                                {node.aiInsights.recommendations.map((rec: string, i: number) => (
                                  <div key={i} className="flex items-start gap-2 p-2 bg-blue-50 rounded">
                                    <CheckCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
                                    <span className="text-sm">{rec}</span>
                                  </div>
                                ))}
                              </div>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Common Use Case</h4>
                              <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                                {node.aiInsights.commonUseCase}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Learning Tip</h4>
                              <p className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded border-l-4 border-yellow-400">
                                💡 {node.aiInsights.learningTip}
                              </p>
                            </div>

                            <div>
                              <h4 className="font-medium mb-2">Difficulty Assessment</h4>
                              <p className="text-sm text-muted-foreground">
                                {node.aiInsights.difficulty}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
