import { useState } from 'react';
import { ArrowLeft, ArrowRight, Upload, Check, Plus, X, FileText, Link as LinkIcon, Paperclip, Trash2, Search, Users as UsersIcon, Shield, UserPlus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Checkbox } from './ui/checkbox';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { toast } from 'sonner@2.0.3';

interface CreateChallengeProps {
  onBack: () => void;
  onComplete: () => void;
}

// Mock groups data
const mockGroups = [
  { id: '1', name: 'Boro Runners', members: 45, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=BR' },
  { id: '2', name: 'City Cyclists', members: 32, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=CC' },
  { id: '3', name: 'Fitness Warriors', members: 28, avatar: 'https://api.dicebear.com/7.x/initials/svg?seed=FW' },
];

// Mock users data
const mockUsers = [
  { id: '1', name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', streak: 15, challenges: 3 },
  { id: '2', name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', streak: 8, challenges: 2 },
  { id: '3', name: 'Emma Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', streak: 22, challenges: 5 },
  { id: '4', name: 'David Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', streak: 12, challenges: 4 },
  { id: '5', name: 'Jessica Taylor', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica', streak: 5, challenges: 1 },
  { id: '6', name: 'Alex Thompson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', streak: 18, challenges: 6 },
  { id: '7', name: 'Rachel Green', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel', streak: 0, challenges: 2 },
  { id: '8', name: 'Tom Anderson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Tom', streak: 30, challenges: 8 },
  { id: '9', name: 'Lisa Brown', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa', streak: 7, challenges: 3 },
  { id: '10', name: 'James Wilson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James', streak: 14, challenges: 4 },
  { id: '11', name: 'Nina Patel', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Nina', streak: 9, challenges: 2 },
  { id: '12', name: 'Chris Martinez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Chris', streak: 25, challenges: 7 },
  { id: '13', name: 'Sophie Davis', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sophie', streak: 3, challenges: 1 },
  { id: '14', name: 'Ryan Cooper', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ryan', streak: 11, challenges: 3 },
  { id: '15', name: 'Olivia Moore', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Olivia', streak: 20, challenges: 5 },
];

export default function CreateChallenge({ onBack, onComplete }: CreateChallengeProps) {
  const [step, setStep] = useState(1);
  
  // Step 1 data
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30');
  const [durationType, setDurationType] = useState('days');
  const [challengeType, setChallengeType] = useState('personal');
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null);
  const [image, setImage] = useState<string | null>(null);

  // Step 2 data
  const [tasks, setTasks] = useState([
    { 
      id: '1', 
      title: '', 
      description: '', 
      required: true,
      isRecurring: false,
      days: [] as string[],
      documents: [] as {id: string, name: string}[],
      links: [] as string[]
    }
  ]);
  const [usePDF, setUsePDF] = useState(false);
  const [pdfFile, setPdfFile] = useState<string | null>(null);

  // Step 3 data
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Step 4 data (Teams)
  interface Team {
    id: string;
    name: string;
    color: string;
    memberIds: string[];
  }
  const [teams, setTeams] = useState<Team[]>([]);
  const [showCreateTeamDialog, setShowCreateTeamDialog] = useState(false);
  const [showAssignDialog, setShowAssignDialog] = useState(false);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [newTeamName, setNewTeamName] = useState('');
  const [newTeamColor, setNewTeamColor] = useState('#00c2ff');

  const teamColors = [
    { name: 'Cyan', value: '#00c2ff' },
    { name: 'Blue', value: '#3b82f6' },
    { name: 'Purple', value: '#a855f7' },
    { name: 'Green', value: '#10b981' },
    { name: 'Orange', value: '#f97316' },
    { name: 'Pink', value: '#ec4899' },
    { name: 'Red', value: '#ef4444' },
    { name: 'Teal', value: '#14b8a6' },
  ];

  const daysOfWeek = [
    { short: 'M', full: 'Monday' },
    { short: 'T', full: 'Tuesday' },
    { short: 'W', full: 'Wednesday' },
    { short: 'T', full: 'Thursday' },
    { short: 'F', full: 'Friday' },
    { short: 'S', full: 'Saturday' },
    { short: 'S', full: 'Sunday' }
  ];

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePDFUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPdfFile(file.name);
      setUsePDF(true);
      // Mock AI parsing
      toast.success('PDF uploaded successfully!', {
        description: 'AI is parsing your plan...'
      });
      setTimeout(() => {
        setTasks([
          { id: '1', title: 'Morning workout - 20 min cardio', description: '', required: true, isRecurring: false, days: [], documents: [], links: [] },
          { id: '2', title: 'Strength training - 3 sets', description: '', required: true, isRecurring: false, days: [], documents: [], links: [] },
          { id: '3', title: 'Log meals and water intake', description: '', required: true, isRecurring: false, days: [], documents: [], links: [] },
        ]);
        toast.success('Tasks generated from PDF!', {
          description: 'Review and edit as needed.'
        });
      }, 2000);
    }
  };

  const addTask = () => {
    setTasks([...tasks, { 
      id: Date.now().toString(), 
      title: '', 
      description: '', 
      required: true,
      isRecurring: false,
      days: [],
      documents: [],
      links: []
    }]);
  };

  const removeTask = (id: string) => {
    if (tasks.length > 1) {
      setTasks(tasks.filter(t => t.id !== id));
    }
  };

  const updateTask = (id: string, field: string, value: any) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, [field]: value } : t));
  };

  const toggleDay = (taskId: string, day: string) => {
    setTasks(tasks.map(task => {
      if (task.id === taskId) {
        const days = task.days.includes(day)
          ? task.days.filter(d => d !== day)
          : [...task.days, day];
        return { ...task, days };
      }
      return task;
    }));
  };

  const addDocument = (taskId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const newDoc = { id: Date.now().toString(), name: file.name };
      setTasks(tasks.map(task => 
        task.id === taskId 
          ? { ...task, documents: [...task.documents, newDoc] }
          : task
      ));
      toast.success(`Document "${file.name}" added!`);
    }
  };

  const removeDocument = (taskId: string, docId: string) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, documents: task.documents.filter(d => d.id !== docId) }
        : task
    ));
  };

  const addLink = (taskId: string, link: string) => {
    if (link.trim()) {
      setTasks(tasks.map(task =>
        task.id === taskId
          ? { ...task, links: [...task.links, link] }
          : task
      ));
    }
  };

  const removeLink = (taskId: string, index: number) => {
    setTasks(tasks.map(task =>
      task.id === taskId
        ? { ...task, links: task.links.filter((_, i) => i !== index) }
        : task
    ));
  };

  const handleNext = () => {
    if (step === 1) {
      if (!title || !description) {
        toast.error('Please fill in all required fields');
        return;
      }
      setStep(2);
    } else if (step === 2) {
      const validTasks = tasks.filter(t => t.title.trim() !== '');
      if (validTasks.length === 0) {
        toast.error('Please add at least one task');
        return;
      }
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const toggleSelectAll = () => {
    const filteredUsers = getFilteredUsers();
    if (selectedUsers.length === filteredUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(filteredUsers.map(u => u.id));
    }
  };

  const getFilteredUsers = () => {
    return mockUsers.filter(user =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  };

  const handleCreateTeam = () => {
    if (!newTeamName.trim()) return;

    const newTeam: Team = {
      id: `t${teams.length + 1}`,
      name: newTeamName,
      color: newTeamColor,
      memberIds: [],
    };

    setTeams([...teams, newTeam]);
    setNewTeamName('');
    setNewTeamColor('#00c2ff');
    setShowCreateTeamDialog(false);
  };

  const handleAssignUser = (userId: string, teamId: string) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          memberIds: [...team.memberIds, userId],
        };
      }
      return team;
    }));
  };

  const handleRemoveUserFromTeam = (userId: string, teamId: string) => {
    setTeams(teams.map(team => {
      if (team.id === teamId) {
        return {
          ...team,
          memberIds: team.memberIds.filter(id => id !== userId),
        };
      }
      return team;
    }));
  };

  const getAssignedUserIds = () => {
    return teams.flatMap(team => team.memberIds);
  };

  const getUnassignedUsers = () => {
    const assignedIds = getAssignedUserIds();
    return mockUsers.filter(user => selectedUsers.includes(user.id) && !assignedIds.includes(user.id));
  };

  const handlePublish = () => {
    if (selectedUsers.length > 0) {
      const teamInfo = teams.length > 0 ? ` and ${teams.length} teams created` : '';
      toast.success(`Challenge created and ${selectedUsers.length} users invited${teamInfo}! 🎉`, {
        description: 'Your challenge is now live!'
      });
    } else {
      toast.success('Challenge created successfully! 🎉', {
        description: 'Your challenge is now live!'
      });
    }
    onComplete();
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation */}
      <div className="sticky top-0 bg-black/80 backdrop-blur-xl border-b border-white/10 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <button
              onClick={step === 1 ? onBack : () => setStep(step - 1)}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-white" />
            </button>
            <h2 className="text-white">Create Challenge</h2>
            <div className="w-9" />
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <div 
            className="flex-1 h-1 rounded-full transition-all" 
            style={{ backgroundColor: step >= 1 ? '#00c2ff' : '#ffffff20' }}
          />
          <div 
            className="flex-1 h-1 rounded-full transition-all" 
            style={{ backgroundColor: step >= 2 ? '#00c2ff' : '#ffffff20' }}
          />
          <div 
            className="flex-1 h-1 rounded-full transition-all" 
            style={{ backgroundColor: step >= 3 ? '#00c2ff' : '#ffffff20' }}
          />
          <div 
            className="flex-1 h-1 rounded-full transition-all" 
            style={{ backgroundColor: step >= 4 ? '#00c2ff' : '#ffffff20' }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="max-w-2xl mx-auto px-4 pb-24">
        {step === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white mb-2">Basic Information</h3>
              <p className="text-white/60 text-sm">Tell us about your challenge</p>
            </div>

            {/* Challenge Image */}
            <div>
              <Label className="text-white/70 mb-3 block">Challenge Image</Label>
              {image ? (
                <div className="relative rounded-2xl overflow-hidden">
                  <img src={image} alt="Challenge" className="w-full h-48 object-cover" />
                  <button
                    onClick={() => setImage(null)}
                    className="absolute top-3 right-3 w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <label className="block cursor-pointer">
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                  <div className="border-2 border-dashed border-white/20 rounded-2xl p-8 text-center hover:border-[#00c2ff] transition-colors bg-white/5 backdrop-blur-sm">
                    <Upload className="w-12 h-12 text-white/40 mx-auto mb-3" />
                    <p className="text-white/60">Upload an image</p>
                  </div>
                </label>
              )}
            </div>

            {/* Title */}
            <div>
              <Label htmlFor="title" className="text-white/70">Challenge Title *</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., 30-Day Fitness Challenge"
                className="mt-2 bg-white/5 border-white/20 text-white rounded-xl py-6 placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff]"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-white/70">Description *</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this challenge is about..."
                className="mt-2 bg-white/5 border-white/20 text-white rounded-xl min-h-[100px] resize-none placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff]"
              />
            </div>

            {/* Duration */}
            <div>
              <Label className="text-white/70">Duration</Label>
              <div className="flex gap-3 mt-2">
                <Input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="bg-white/5 border-white/20 text-white rounded-xl py-6 focus:bg-white/10 focus:border-[#00c2ff]"
                  min="1"
                />
                <Select value={durationType} onValueChange={setDurationType}>
                  <SelectTrigger className="bg-white/5 border-white/20 text-white rounded-xl py-6">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/20">
                    <SelectItem value="days">Days</SelectItem>
                    <SelectItem value="weeks">Weeks</SelectItem>
                    <SelectItem value="months">Months</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Challenge Type */}
            <div>
              <Label className="text-white/70 mb-3 block">Challenge Type</Label>
              <div className="grid grid-cols-2 gap-3">
                {['personal', 'group'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setChallengeType(type)}
                    className="p-4 rounded-xl border-2 transition-all"
                    style={
                      challengeType === type
                        ? { borderColor: '#00c2ff', backgroundColor: '#00c2ff20' }
                        : { borderColor: '#ffffff20', backgroundColor: '#ffffff05' }
                    }
                  >
                    <div className="capitalize text-white">{type}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Group Selection - Only show when group type is selected */}
            {challengeType === 'group' && (
              <div>
                <Label className="text-white/70 mb-3 block">Select Your Group</Label>
                <div className="space-y-3">
                  {mockGroups.map((group) => (
                    <button
                      key={group.id}
                      onClick={() => setSelectedGroup(group.id)}
                      className="w-full p-4 rounded-xl border-2 transition-all flex items-center gap-3"
                      style={
                        selectedGroup === group.id
                          ? { borderColor: '#00c2ff', backgroundColor: '#00c2ff20' }
                          : { borderColor: '#ffffff20', backgroundColor: '#ffffff05' }
                      }
                    >
                      <Avatar className="w-12 h-12">
                        <AvatarImage src={group.avatar} />
                        <AvatarFallback>{group.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1 text-left">
                        <div className="text-white">{group.name}</div>
                        <div className="text-sm text-white/60">{group.members} members</div>
                      </div>
                      {selectedGroup === group.id && (
                        <Check className="w-5 h-5" style={{ color: '#00c2ff' }} />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white mb-2">Tasks & Schedule</h3>
              <p className="text-white/60 text-sm">Define the daily tasks for your challenge</p>
            </div>

            {/* PDF Upload Option */}
            <div className="p-5 rounded-2xl backdrop-blur-md border border-white/20" style={{ backgroundColor: '#00c2ff20' }}>
              <h4 className="text-white mb-2">Upload AI-Generated Plan (Optional)</h4>
              <p className="text-sm text-white/70 mb-3">
                Have a PDF plan? Upload it and we'll automatically parse it into tasks!
              </p>
              <label className="block cursor-pointer">
                <input type="file" accept=".pdf" onChange={handlePDFUpload} className="hidden" />
                <Button variant="outline" className="w-full bg-white/20 border-white/30 text-white hover:bg-white/30 backdrop-blur-sm" type="button">
                  <FileText className="w-4 h-4 mr-2" />
                  {pdfFile || 'Upload PDF Plan'}
                </Button>
              </label>
            </div>

            {/* Manual Task Entry */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <Label className="text-white/70">Daily Tasks</Label>
                <Button onClick={addTask} variant="outline" size="sm" className="rounded-full bg-white/5 border-white/20 text-white hover:bg-white/10">
                  <Plus className="w-4 h-4 mr-1" />
                  Add Task
                </Button>
              </div>

              <div className="space-y-4">
                {tasks.map((task, index) => (
                  <Card key={task.id} className="p-5 bg-white/5 border-2 border-white/10 backdrop-blur-sm">
                    <div className="flex items-start gap-3">
                      <div className="flex-1 space-y-4">
                        {/* Task Title & Description */}
                        <Input
                          value={task.title}
                          onChange={(e) => updateTask(task.id, 'title', e.target.value)}
                          placeholder={`Task ${index + 1}: e.g., Drink 2 litres of water`}
                          className="border-white/20 bg-white/5 text-white rounded-xl placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff]"
                        />
                        <Textarea
                          value={task.description}
                          onChange={(e) => updateTask(task.id, 'description', e.target.value)}
                          placeholder="Description (optional)"
                          className="border-white/20 bg-white/5 text-white rounded-xl min-h-[60px] resize-none placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff]"
                        />

                        {/* Recurring */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-white/60">Recurring</span>
                            <Switch
                              checked={task.isRecurring}
                              onCheckedChange={(checked) => updateTask(task.id, 'isRecurring', checked)}
                            />
                          </div>
                        </div>

                        {/* Day Selection - Only show if recurring */}
                        {task.isRecurring && (
                          <div className="space-y-2">
                            <Label className="text-white/70 text-sm">Select Days</Label>
                            <div className="flex gap-2">
                              {daysOfWeek.map((day, idx) => (
                                <button
                                  key={idx}
                                  type="button"
                                  onClick={() => toggleDay(task.id, day.full)}
                                  className="w-10 h-10 rounded-full border-2 transition-all flex items-center justify-center"
                                  style={
                                    task.days.includes(day.full)
                                      ? { backgroundColor: '#00c2ff', borderColor: '#00c2ff', color: 'white' }
                                      : { backgroundColor: '#ffffff10', borderColor: '#ffffff30', color: '#ffffff60' }
                                  }
                                  title={day.full}
                                >
                                  <span className="text-sm">{day.short}</span>
                                </button>
                              ))}
                            </div>
                            {task.days.length > 0 && (
                              <p className="text-xs text-white/50">
                                Selected: {task.days.join(', ')}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Documents */}
                        <div className="space-y-2">
                          <Label className="text-white/70 text-sm">Documents (Optional)</Label>
                          <div className="flex gap-2">
                            <label className="flex-1">
                              <input
                                type="file"
                                onChange={(e) => addDocument(task.id, e)}
                                className="hidden"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                className="w-full border-white/30 bg-white/5 text-white rounded-xl hover:bg-white/10"
                                onClick={(e) => {
                                  e.preventDefault();
                                  (e.currentTarget.previousElementSibling as HTMLInputElement)?.click();
                                }}
                              >
                                <Paperclip className="w-4 h-4 mr-2" />
                                Upload Document
                              </Button>
                            </label>
                          </div>
                          {task.documents.length > 0 && (
                            <div className="space-y-1">
                              {task.documents.map((doc) => (
                                <div key={doc.id} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                                  <span className="text-sm text-white/70 truncate flex-1">{doc.name}</span>
                                  <button
                                    type="button"
                                    onClick={() => removeDocument(task.id, doc.id)}
                                    className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Links */}
                        <div className="space-y-2">
                          <Label className="text-white/70 text-sm">Youtube Links (Optional)</Label>
                          <div className="flex gap-2">
                            <Input
                              placeholder="https://www.youtube.com/watch?v=..."
                              className="border-white/20 bg-white/5 text-white rounded-xl placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff]"
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.preventDefault();
                                  const input = e.currentTarget;
                                  addLink(task.id, input.value);
                                  input.value = '';
                                }
                              }}
                            />
                            <Button
                              type="button"
                              variant="outline"
                              className="border-white/30 bg-white/5 text-white rounded-xl hover:bg-white/10"
                              onClick={(e) => {
                                const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                                addLink(task.id, input.value);
                                input.value = '';
                              }}
                            >
                              <LinkIcon className="w-4 h-4" />
                            </Button>
                          </div>
                          {task.links.length > 0 && (
                            <div className="space-y-1">
                              {task.links.map((link, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10">
                                  <a
                                    href={link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-sm hover:underline truncate flex-1"
                                    style={{ color: '#00c2ff' }}
                                  >
                                    {link}
                                  </a>
                                  <button
                                    type="button"
                                    onClick={() => removeLink(task.id, idx)}
                                    className="p-1 hover:bg-red-500/20 text-red-400 rounded transition-colors"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Remove Task Button */}
                      {tasks.length > 1 && (
                        <button
                          onClick={() => removeTask(task.id)}
                          className="p-2 hover:bg-red-500/20 text-red-400 rounded-full transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white mb-2">Invite Users</h3>
              <p className="text-white/60 text-sm">Select users to invite to your challenge</p>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="pl-12 bg-white/5 border-white/20 text-white rounded-xl py-6 placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff]"
              />
            </div>

            {/* Select All */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border-2 border-white/10 backdrop-blur-sm">
              <div className="flex items-center gap-3">
                <Checkbox
                  id="select-all"
                  checked={selectedUsers.length === getFilteredUsers().length && getFilteredUsers().length > 0}
                  onCheckedChange={toggleSelectAll}
                />
                <label htmlFor="select-all" className="text-white cursor-pointer">
                  Select All ({getFilteredUsers().length} users)
                </label>
              </div>
              {selectedUsers.length > 0 && (
                <Badge className="border-0" style={{ backgroundColor: '#00c2ff20', color: '#00c2ff' }}>
                  {selectedUsers.length} selected
                </Badge>
              )}
            </div>

            {/* Users List */}
            <div className="space-y-2 max-h-[calc(100vh-480px)] overflow-y-auto pb-4">
              {getFilteredUsers().map((user) => (
                <div
                  key={user.id}
                  className="p-4 rounded-xl border-2 transition-all cursor-pointer backdrop-blur-sm"
                  style={
                    selectedUsers.includes(user.id)
                      ? { borderColor: '#00c2ff', backgroundColor: '#00c2ff20' }
                      : { borderColor: '#ffffff20', backgroundColor: '#ffffff05' }
                  }
                  onClick={() => toggleUserSelection(user.id)}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      id={`user-${user.id}`}
                      checked={selectedUsers.includes(user.id)}
                      onCheckedChange={() => toggleUserSelection(user.id)}
                      className="pointer-events-none"
                    />
                    <Avatar className="w-12 h-12 ring-2 ring-white/20">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="text-white">{user.name}</div>
                      <div className="flex items-center gap-3 text-sm text-white/60 mt-1">
                        <span>{user.streak}🔥 streak</span>
                        <span>•</span>
                        <span>{user.challenges} challenges</span>
                      </div>
                    </div>
                    {selectedUsers.includes(user.id) && (
                      <Check className="w-5 h-5" style={{ color: '#00c2ff' }} />
                    )}
                  </div>
                </div>
              ))}
              {getFilteredUsers().length === 0 && (
                <div className="text-center py-12">
                  <UsersIcon className="w-12 h-12 text-white/30 mx-auto mb-3" />
                  <p className="text-white/50">No users found</p>
                </div>
              )}
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-white mb-2">Team Setup (Optional)</h3>
              <p className="text-white/60 text-sm">
                Create teams to enable competition between groups
              </p>
            </div>

            {/* Create Team Button */}
            <Button 
              onClick={() => setShowCreateTeamDialog(true)}
              className="w-full text-black py-6 rounded-xl"
              style={{ backgroundColor: '#00c2ff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
            >
              <Plus className="w-5 h-5 mr-2" />
              Create Team
            </Button>

            {/* Teams List */}
            {teams.length > 0 && (
              <div className="space-y-4">
                {teams.map(team => {
                  const teamMembers = mockUsers.filter(user => team.memberIds.includes(user.id));
                  return (
                    <div key={team.id} className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden backdrop-blur-sm">
                      {/* Team Header */}
                      <div 
                        className="p-4 flex items-center justify-between border-b-2"
                        style={{ backgroundColor: team.color + '20', borderBottomColor: team.color }}
                      >
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-12 h-12 rounded-full flex items-center justify-center text-white"
                            style={{ backgroundColor: team.color }}
                          >
                            <Shield className="w-6 h-6" />
                          </div>
                          <div>
                            <h4 className="text-white">{team.name}</h4>
                            <div className="text-sm text-white/60">
                              {team.memberIds.length} members
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setSelectedTeamId(team.id);
                            setShowAssignDialog(true);
                          }}
                          className="border-white/30 bg-white/10 text-white hover:bg-white/20"
                        >
                          <UserPlus className="w-4 h-4 mr-2" />
                          Add
                        </Button>
                      </div>

                      {/* Team Members */}
                      <div className="p-4">
                        {teamMembers.length === 0 ? (
                          <div className="text-center py-6 text-white/50">
                            <UsersIcon className="w-10 h-10 mx-auto mb-2 opacity-30" />
                            <p className="text-sm">No members yet</p>
                          </div>
                        ) : (
                          <div className="grid gap-2 sm:grid-cols-2">
                            {teamMembers.map(member => (
                              <div
                                key={member.id}
                                className="flex items-center justify-between p-3 rounded-xl border border-white/10 bg-white/5"
                              >
                                <div className="flex items-center gap-3">
                                  <Avatar className="w-10 h-10">
                                    <AvatarImage src={member.avatar} />
                                    <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                                  </Avatar>
                                  <div>
                                    <div className="text-sm text-white">{member.name}</div>
                                    <div className="text-xs text-white/60">
                                      {member.streak}🔥 streak
                                    </div>
                                  </div>
                                </div>
                                <button
                                  onClick={() => handleRemoveUserFromTeam(member.id, team.id)}
                                  className="p-1.5 hover:bg-red-500/20 rounded-lg transition-colors"
                                >
                                  <X className="w-4 h-4 text-red-400" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Unassigned Users */}
            {getUnassignedUsers().length > 0 && (
              <div className="bg-white/5 rounded-2xl p-5 border border-white/10 backdrop-blur-sm">
                <h4 className="text-white mb-4 flex items-center gap-2">
                  <UsersIcon className="w-5 h-5 text-white/60" />
                  Unassigned Participants ({getUnassignedUsers().length})
                </h4>
                <div className="grid gap-3 sm:grid-cols-2">
                  {getUnassignedUsers().map(user => (
                    <div
                      key={user.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-white/5 border border-white/10"
                    >
                      <div className="flex items-center gap-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={user.avatar} />
                          <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm text-white">{user.name}</div>
                          <div className="text-xs text-white/60">
                            {user.streak}🔥 streak
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs border-white/30 text-white/60">
                        Not assigned
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {teams.length === 0 && (
              <div className="text-center py-12 bg-white/5 rounded-2xl border-2 border-dashed border-white/20 backdrop-blur-sm">
                <Shield className="w-16 h-16 mx-auto mb-4 text-white/30" />
                <h4 className="text-white mb-2">No Teams Yet</h4>
                <p className="text-sm text-white/60 mb-6 max-w-md mx-auto">
                  Create teams to organize participants and enable team-based competition
                </p>
                <Button 
                  onClick={() => setShowCreateTeamDialog(true)}
                  className="text-black"
                  style={{ backgroundColor: '#00c2ff' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create Your First Team
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Create Team Dialog */}
      {showCreateTeamDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/20 rounded-2xl max-w-md w-full p-6">
            <h3 className="text-white mb-2">Create New Team</h3>
            <p className="text-sm text-white/60 mb-6">
              Give your team a name and choose a color
            </p>
            
            <div className="space-y-4 mb-6">
              <div>
                <Label htmlFor="team-name" className="text-white/70 mb-2 block">Team Name</Label>
                <Input
                  id="team-name"
                  placeholder="e.g., Team Thunder"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="border-white/20 bg-white/5 text-white rounded-xl placeholder:text-white/40 focus:bg-white/10 focus:border-[#00c2ff]"
                />
              </div>

              <div>
                <Label className="text-white/70 mb-3 block">Team Color</Label>
                <div className="grid grid-cols-4 gap-2">
                  {teamColors.map(color => (
                    <button
                      key={color.value}
                      onClick={() => setNewTeamColor(color.value)}
                      className="h-12 rounded-lg border-2 transition-all flex items-center justify-center"
                      style={{
                        backgroundColor: color.value,
                        borderColor: newTeamColor === color.value ? '#fff' : color.value,
                        transform: newTeamColor === color.value ? 'scale(1.05)' : 'scale(1)',
                      }}
                    >
                      {newTeamColor === color.value && (
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <Check className="w-4 h-4 text-black" />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setShowCreateTeamDialog(false)}
                className="flex-1 border-white/30 bg-white/5 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateTeam}
                className="flex-1 text-black"
                style={{ backgroundColor: '#00c2ff' }}
                disabled={!newTeamName.trim()}
                onMouseEnter={(e) => !newTeamName.trim() ? null : e.currentTarget.style.backgroundColor = '#00a8e0'}
                onMouseLeave={(e) => !newTeamName.trim() ? null : e.currentTarget.style.backgroundColor = '#00c2ff'}
              >
                Create Team
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Assign User Dialog */}
      {showAssignDialog && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-zinc-900 border border-white/20 rounded-2xl max-w-md w-full p-6 max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-white mb-2">Add Member to Team</h3>
            <p className="text-sm text-white/60 mb-6">
              Select a participant to add to {teams.find(t => t.id === selectedTeamId)?.name}
            </p>
            
            <div className="space-y-2 overflow-y-auto flex-1 mb-6">
              {getUnassignedUsers().length === 0 ? (
                <div className="text-center py-8 text-white/50">
                  <p className="text-sm">All participants are assigned to teams</p>
                </div>
              ) : (
                getUnassignedUsers().map(user => (
                  <button
                    key={user.id}
                    onClick={() => {
                      if (selectedTeamId) {
                        handleAssignUser(user.id, selectedTeamId);
                        setShowAssignDialog(false);
                      }
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={user.avatar} />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left">
                      <div className="text-sm text-white">{user.name}</div>
                      <div className="text-xs text-white/60">
                        {user.streak}🔥 streak
                      </div>
                    </div>
                    <UserPlus className="w-5 h-5 text-white/40" />
                  </button>
                ))
              )}
            </div>

            <Button 
              variant="outline" 
              onClick={() => setShowAssignDialog(false)}
              className="w-full border-white/30 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 backdrop-blur-xl border-t border-white/10">
        <div className="max-w-2xl mx-auto">
          {step === 1 ? (
            <Button
              onClick={handleNext}
              className="w-full text-black py-6 rounded-xl"
              style={{ backgroundColor: '#00c2ff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
            >
              Next: Tasks & Schedule
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : step === 2 ? (
            <Button
              onClick={handleNext}
              className="w-full text-black py-6 rounded-xl"
              style={{ backgroundColor: '#00c2ff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
            >
              Next: Invite Users
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : step === 3 ? (
            <Button
              onClick={handleNext}
              className="w-full text-black py-6 rounded-xl"
              style={{ backgroundColor: '#00c2ff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
            >
              {selectedUsers.length > 0 ? 'Next: Team Setup (Optional)' : 'Skip to Publish'}
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          ) : (
            <div className="space-y-3">
              {selectedUsers.length > 0 && (
                <div className="text-center text-sm text-white/60">
                  {selectedUsers.length} user{selectedUsers.length !== 1 ? 's' : ''} will be invited
                  {teams.length > 0 && ` • ${teams.length} team${teams.length !== 1 ? 's' : ''} created`}
                </div>
              )}
              <Button
                onClick={handlePublish}
                className="w-full text-black py-6 rounded-xl"
                style={{ backgroundColor: '#00c2ff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
              >
                <Check className="w-5 h-5 mr-2" />
                {selectedUsers.length > 0 ? 'Publish & Invite' : 'Publish Challenge'}
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
