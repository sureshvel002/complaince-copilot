import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  ShieldCheck, 
  MessageSquare, 
  FileText, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Search,
  ChevronRight,
  Download,
  BarChart3,
  Info,
  Send,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip as RechartsTooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

import { AIModel, ModelAnalysis, ChatMessage, RiskLevel, ComplianceStatus } from './types';
import { MOCK_MODELS } from './constants';
import { GeminiService } from './services/geminiService';
import { cn } from '@/lib/utils';

export default function App() {
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [analysis, setAnalysis] = useState<ModelAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('dashboard');

  const handleAnalyzeModel = async (model: AIModel) => {
    setSelectedModel(model);
    setIsAnalyzing(true);
    setActiveTab('analysis');
    try {
      const result = await GeminiService.analyzeModel(model);
      setAnalysis(result);
      
      // Add initial AI message
      const initialMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `I've completed the compliance analysis for **${model.name}**. The risk level is classified as **${result.riskLevel}**. How can I help you explore these findings?`,
        timestamp: new Date()
      };
      setChatMessages([initialMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputMessage,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMsg]);
    setInputMessage('');
    setIsChatLoading(true);

    try {
      const response = await GeminiService.chat([...chatMessages, userMsg], analysis);
      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      setChatMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error(error);
    } finally {
      setIsChatLoading(false);
    }
  };

  return (
    <TooltipProvider>
      <div className="flex h-screen bg-background overflow-hidden font-sans">
        {/* Sidebar */}
        <aside className="w-64 border-r bg-white flex flex-col z-20">
          <div className="p-6 border-bottom">
            <div className="flex items-center gap-2 text-primary font-bold text-xl">
              <ShieldCheck className="w-8 h-8" />
              <span>Compliance</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium tracking-wider uppercase">Copilot v1.0</p>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            <NavItem 
              icon={<LayoutDashboard className="w-4 h-4" />} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => setActiveTab('dashboard')}
            />
            <NavItem 
              icon={<BarChart3 className="w-4 h-4" />} 
              label="Model Analysis" 
              active={activeTab === 'analysis'} 
              onClick={() => selectedModel && setActiveTab('analysis')}
              disabled={!selectedModel}
            />
            <NavItem 
              icon={<FileText className="w-4 h-4" />} 
              label="Audit Reports" 
              active={activeTab === 'reports'} 
              onClick={() => setActiveTab('reports')}
            />
          </nav>

          <div className="p-4 border-t">
            <Card className="bg-primary/5 border-none">
              <CardContent className="p-4">
                <p className="text-xs font-semibold text-primary mb-2">SYSTEM STATUS</p>
                <div className="flex items-center gap-2 text-xs">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>All Regulations Synced</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative overflow-hidden">
          <header className="h-16 border-b bg-white flex items-center justify-between px-8 z-10">
            <div className="flex items-center gap-4">
              <h2 className="text-lg font-semibold text-charcoal">
                {activeTab === 'dashboard' ? 'Model Governance Dashboard' : 
                 activeTab === 'analysis' ? `Analysis: ${selectedModel?.name}` : 
                 'Compliance Reports'}
              </h2>
              {selectedModel && activeTab === 'analysis' && (
                <Badge variant="outline" className="font-mono text-[10px] uppercase tracking-widest">
                  {selectedModel.version}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input placeholder="Search models or regs..." className="pl-9 h-9 bg-muted/50 border-none" />
              </div>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="w-4 h-4" />
                Export
              </Button>
            </div>
          </header>

          <div className="flex-1 overflow-auto p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div 
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Stats Grid */}
                  <div className="grid grid-cols-4 gap-6">
                    <StatCard label="Total Models" value="24" trend="+3 this month" />
                    <StatCard label="High Risk" value="4" trend="Requires Action" color="text-red-600" />
                    <StatCard label="Avg Approval Time" value="3.2d" trend="-12% vs last qtr" />
                    <StatCard label="Compliance Score" value="94%" trend="Target: 90%" color="text-emerald-600" />
                  </div>

                  {/* Model List */}
                  <Card className="tech-card">
                    <CardHeader>
                      <CardTitle>Inventory & Risk Status</CardTitle>
                      <CardDescription>Monitor and analyze AI models across the organization.</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Model Name</TableHead>
                            <TableHead>Risk Level</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Last Analyzed</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {MOCK_MODELS.map((model) => (
                            <TableRow key={model.id}>
                              <TableCell className="font-medium">
                                <div>{model.name}</div>
                                <div className="text-xs text-muted-foreground font-mono">{model.type}</div>
                              </TableCell>
                              <TableCell>
                                <RiskBadge level={model.riskLevel} />
                              </TableCell>
                              <TableCell>
                                <StatusBadge status={model.status} />
                              </TableCell>
                              <TableCell className="text-muted-foreground text-sm">{model.lastAnalyzed}</TableCell>
                              <TableCell className="text-right">
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="text-primary hover:text-primary hover:bg-primary/5"
                                  onClick={() => handleAnalyzeModel(model)}
                                >
                                  Analyze <ChevronRight className="ml-1 w-4 h-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </CardContent>
                  </Card>
                </motion.div>
              )}

              {activeTab === 'analysis' && (
                <motion.div 
                  key="analysis"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {isAnalyzing ? (
                    <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
                      <Loader2 className="w-12 h-12 text-primary animate-spin" />
                      <div>
                        <h3 className="text-xl font-semibold">Analyzing Model Architecture</h3>
                        <p className="text-muted-foreground">Retrieving regulatory context and calculating risk scores...</p>
                      </div>
                    </div>
                  ) : analysis ? (
                    <div className="grid grid-cols-3 gap-6">
                      <div className="col-span-2 space-y-6">
                        {/* Summary Card */}
                        <Card className="tech-card">
                          <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                              <CardTitle>Compliance Summary</CardTitle>
                              <CardDescription>AI-generated risk classification and reasoning.</CardDescription>
                            </div>
                            <RiskBadge level={analysis.riskLevel} className="text-lg px-4 py-1" />
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <p className="text-sm leading-relaxed text-charcoal/80">{analysis.summary}</p>
                            <Separator />
                            <div>
                              <h4 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                <Info className="w-4 h-4 text-primary" />
                                Decision Logic Explanation
                              </h4>
                              <p className="text-sm text-muted-foreground italic">{analysis.explanation}</p>
                            </div>
                          </CardContent>
                        </Card>

                        {/* Feature Importance */}
                        <Card className="tech-card">
                          <CardHeader>
                            <CardTitle>Feature Importance & Bias Check</CardTitle>
                            <CardDescription>Identifying key drivers of model decisions.</CardDescription>
                          </CardHeader>
                          <CardContent className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                              <BarChart data={analysis.featureImportance} layout="vertical" margin={{ left: 40, right: 40 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f0f0f0" />
                                <XAxis type="number" hide />
                                <YAxis 
                                  dataKey="feature" 
                                  type="category" 
                                  axisLine={false} 
                                  tickLine={false}
                                  tick={{ fontSize: 12, fill: '#666' }}
                                />
                                <RechartsTooltip 
                                  cursor={{ fill: 'transparent' }}
                                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                />
                                <Bar dataKey="importance" radius={[0, 4, 4, 0]} barSize={20}>
                                  {analysis.featureImportance.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index === 0 ? '#1E3A8A' : '#14B8A6'} />
                                  ))}
                                </Bar>
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>

                        {/* Checklist */}
                        <Card className="tech-card">
                          <CardHeader>
                            <CardTitle>Regulatory Checklist</CardTitle>
                            <CardDescription>Validation against specific legal frameworks.</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <div className="space-y-4">
                              {analysis.checklist.map((check, idx) => (
                                <div key={idx} className="flex items-start gap-4 p-4 rounded-lg bg-muted/30 border border-transparent hover:border-border transition-colors">
                                  <div className="mt-1">
                                    <StatusIcon status={check.status} />
                                  </div>
                                  <div className="flex-1">
                                    <div className="flex items-center justify-between mb-1">
                                      <span className="text-xs font-bold uppercase tracking-wider text-primary">{check.category}</span>
                                      <Badge variant="secondary" className="text-[10px]">{check.status}</Badge>
                                    </div>
                                    <p className="text-sm font-medium mb-1">{check.requirement}</p>
                                    {check.recommendation && (
                                      <p className="text-xs text-muted-foreground">
                                        <span className="font-semibold text-accent">Recommendation:</span> {check.recommendation}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Right Column - Context & Actions */}
                      <div className="space-y-6">
                        <Card className="tech-card bg-primary text-white border-none">
                          <CardHeader>
                            <CardTitle className="text-white">Audit Ready?</CardTitle>
                            <CardDescription className="text-white/70">Current compliance standing for this model.</CardDescription>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                              <span>Validation Score</span>
                              <span className="text-2xl font-bold">82%</span>
                            </div>
                            <div className="w-full bg-white/20 h-2 rounded-full overflow-hidden">
                              <div className="bg-white h-full" style={{ width: '82%' }} />
                            </div>
                            <Button 
                              className="w-full bg-white text-primary hover:bg-white/90 font-bold"
                              onClick={() => {
                                const btn = document.activeElement as HTMLButtonElement;
                                const originalText = btn.innerText;
                                btn.innerText = "Generating PDF...";
                                btn.disabled = true;
                                setTimeout(() => {
                                  btn.innerText = "Report Downloaded";
                                  setTimeout(() => {
                                    btn.innerText = originalText;
                                    btn.disabled = false;
                                  }, 2000);
                                }, 1500);
                              }}
                            >
                              Generate Audit Report
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="tech-card">
                          <CardHeader>
                            <CardTitle className="text-sm">Model Metadata</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3 text-sm">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Type</span>
                              <span className="font-medium">{selectedModel?.type}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Version</span>
                              <span className="font-mono">{selectedModel?.version}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Last Run</span>
                              <span>{selectedModel?.lastAnalyzed}</span>
                            </div>
                            <Separator />
                            <div>
                              <span className="text-muted-foreground block mb-2">Input Features</span>
                              <div className="flex flex-wrap gap-1">
                                {selectedModel?.features.map(f => (
                                  <Badge key={f} variant="outline" className="text-[10px] font-mono">{f}</Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </div>
                  ) : null}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </main>

        {/* Chat Panel */}
        <aside className="w-96 border-l bg-white flex flex-col z-20">
          <div className="p-4 border-b flex items-center justify-between bg-muted/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
                <MessageSquare className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold">Compliance Copilot</h3>
                <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-tighter">AI Assistant Online</p>
              </div>
            </div>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Info className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="text-xs">Ask about regulations, risk factors, or remediation steps.</p>
              </TooltipContent>
            </Tooltip>
          </div>

          <ScrollArea className="flex-1 p-4">
            <div className="space-y-4">
              {chatMessages.length === 0 && (
                <div className="text-center py-8 space-y-4">
                  <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto">
                    <ShieldCheck className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">How can I help you today?</p>
                    <p className="text-xs text-muted-foreground px-8">Select a model to start a compliance analysis or ask a general question.</p>
                  </div>
                  <div className="grid grid-cols-1 gap-2 px-4">
                    <SuggestedPrompt text="Check GDPR compliance" onClick={() => setInputMessage("Check GDPR compliance for the selected model")} />
                    <SuggestedPrompt text="Explain high risk factors" onClick={() => setInputMessage("Explain why this model is considered high risk")} />
                    <SuggestedPrompt text="View EU AI Act requirements" onClick={() => setInputMessage("What are the EU AI Act requirements for this model type?")} />
                  </div>
                </div>
              )}
              {chatMessages.map((msg) => (
                <div key={msg.id} className={cn(
                  "flex flex-col max-w-[85%]",
                  msg.role === 'user' ? "ml-auto items-end" : "mr-auto items-start"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm",
                    msg.role === 'user' 
                      ? "bg-primary text-white rounded-tr-none" 
                      : "bg-muted text-charcoal rounded-tl-none border border-border/50"
                  )}>
                    {msg.content}
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))}
              {isChatLoading && (
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span className="text-xs italic">Copilot is thinking...</span>
                </div>
              )}
            </div>
          </ScrollArea>

          <div className="p-4 border-t bg-muted/5">
            <div className="relative">
              <Input 
                placeholder="Ask a compliance question..." 
                className="pr-10 bg-white"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
              />
              <Button 
                size="icon" 
                variant="ghost" 
                className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary"
                onClick={handleSendMessage}
                disabled={isChatLoading || !inputMessage.trim()}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </aside>
      </div>
    </TooltipProvider>
  );
}

function NavItem({ icon, label, active, onClick, disabled = false }: { icon: ReactNode, label: string, active: boolean, onClick: () => void, disabled?: boolean }) {
  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted hover:text-charcoal",
        disabled && "opacity-50 cursor-not-allowed"
      )}
    >
      {icon}
      {label}
    </button>
  );
}

function StatCard({ label, value, trend, color = "text-charcoal" }: { label: string, value: string, trend: string, color?: string }) {
  return (
    <Card className="tech-card">
      <CardContent className="p-6">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
        <h3 className={cn("text-3xl font-bold mb-1", color)}>{value}</h3>
        <p className="text-[10px] font-medium text-muted-foreground">{trend}</p>
      </CardContent>
    </Card>
  );
}

function RiskBadge({ level, className }: { level: RiskLevel, className?: string }) {
  const styles = {
    High: "risk-high",
    Medium: "risk-medium",
    Low: "risk-low"
  };
  return (
    <Badge variant="outline" className={cn("font-bold", styles[level], className)}>
      {level} Risk
    </Badge>
  );
}

function StatusBadge({ status }: { status: AIModel['status'] }) {
  const styles = {
    Approved: "bg-emerald-100 text-emerald-700 border-emerald-200",
    Pending: "bg-amber-100 text-amber-700 border-amber-200",
    Rejected: "bg-red-100 text-red-700 border-red-200"
  };
  return (
    <Badge variant="outline" className={cn("font-medium", styles[status])}>
      {status}
    </Badge>
  );
}

function StatusIcon({ status }: { status: ComplianceStatus }) {
  switch (status) {
    case 'Pass': return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
    case 'Fail': return <XCircle className="w-5 h-5 text-red-500" />;
    case 'Warning': return <AlertTriangle className="w-5 h-5 text-amber-500" />;
  }
}

function SuggestedPrompt({ text, onClick }: { text: string, onClick: () => void }) {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="text-[10px] justify-start h-auto py-2 px-3 bg-muted/20 border-border/50 hover:bg-primary/5 hover:border-primary/30"
      onClick={onClick}
    >
      {text}
    </Button>
  );
}
