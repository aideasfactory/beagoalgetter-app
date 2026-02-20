import { useState } from 'react';
import { Settings, Edit, Trophy, TrendingUp, Award, Calendar, Instagram, Twitter, Facebook, Users, Upload, Plus, Target } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner@2.0.3';

interface ProfileProps {
  onSettingsClick: () => void;
}

const userProfile = {
  name: 'Sarah Johnson',
  username: '@sarahj',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
  bio: 'Fitness enthusiast | Building consistency one day at a time 💪',
  dateOfBirth: 'March 15, 1995',
  joinDate: 'Joined October 2024',
  stats: {
    totalChallenges: 12,
    activeChallenges: 3,
    completedChallenges: 9,
    longestStreak: 45,
    currentStreak: 15,
    totalPoints: 2450,
  },
  badges: [
    { id: 1, name: 'First Challenge', icon: '🎯', earned: true },
    { id: 2, name: '7 Day Streak', icon: '🔥', earned: true },
    { id: 3, name: '30 Day Streak', icon: '💪', earned: true },
    { id: 4, name: 'Team Player', icon: '🤝', earned: true },
    { id: 5, name: '100 Day Streak', icon: '🏆', earned: false },
    { id: 6, name: 'Perfect Challenge', icon: '⭐', earned: false },
  ],
  socialConnections: {
    instagram: true,
    twitter: false,
    facebook: false,
  },
};

// Circular progress component
function CircularProgress({ value, max, color, label, sublabel }: { value: number; max: number; color: string; label: string; sublabel: string }) {
  const percentage = (value / max) * 100;
  const circumference = 2 * Math.PI * 45; // radius = 45
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className="relative flex flex-col items-center">
      <svg className="w-32 h-32 transform -rotate-90">
        {/* Background circle */}
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke="rgba(255,255,255,0.1)"
          strokeWidth="8"
          fill="none"
        />
        {/* Progress circle */}
        <circle
          cx="64"
          cy="64"
          r="45"
          stroke={color}
          strokeWidth="8"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.5s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="text-3xl text-white">{value}</div>
        <div className="text-xs text-white/60">{sublabel}</div>
      </div>
      <div className="mt-2 text-white text-sm text-center">{label}</div>
    </div>
  );
}

export default function Profile({ onSettingsClick }: ProfileProps) {
  const [isCreateGroupOpen, setIsCreateGroupOpen] = useState(false);
  const [groupName, setGroupName] = useState('');
  const [groupDescription, setGroupDescription] = useState('');
  const [groupBrandColor, setGroupBrandColor] = useState('#00c2ff');
  const [groupLogo, setGroupLogo] = useState<string | null>(null);
  const [totalMembers, setTotalMembers] = useState('');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setGroupLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateGroup = () => {
    if (!groupName || !groupDescription || !totalMembers) {
      toast.error('Please fill in all required fields');
      return;
    }

    toast.success('Group created successfully!', {
      description: `${groupName} is now live with ${totalMembers} members`
    });

    // Reset form
    setGroupName('');
    setGroupDescription('');
    setGroupBrandColor('#00c2ff');
    setGroupLogo(null);
    setTotalMembers('');
    setIsCreateGroupOpen(false);
  };

  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation */}
      <div className="sticky top-0 bg-black border-b border-white/10 z-40 backdrop-blur-xl">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <h1 className="text-white">Profile</h1>
            <button
              onClick={onSettingsClick}
              className="p-2 hover:bg-white/10 rounded-full transition-colors"
            >
              <Settings className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Profile Header */}
        <div className="p-6 bg-[#1a1a1a] rounded-2xl border border-white/10">
          <div className="flex items-start gap-4 mb-4">
            <div className="relative">
              <Avatar className="w-24 h-24 ring-4 ring-[#00c2ff]/30">
                <AvatarImage src={userProfile.avatar} />
                <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <button 
                className="absolute bottom-0 right-0 w-8 h-8 text-black rounded-full flex items-center justify-center shadow-lg transition-colors"
                style={{ backgroundColor: '#00c2ff' }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
              >
                <Edit className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1">
              <h2 className="text-white mb-1">{userProfile.name}</h2>
              <p className="text-white/60 text-sm mb-2">{userProfile.username}</p>
              <Badge variant="secondary" className="bg-white/10 text-white/60 border-0">
                {userProfile.joinDate}
              </Badge>
            </div>
          </div>

          <p className="text-white/80 mb-4">{userProfile.bio}</p>

          <div className="flex items-center gap-2 text-sm text-white/60">
            <Calendar className="w-4 h-4" />
            <span>Born {userProfile.dateOfBirth}</span>
          </div>
        </div>

        {/* Circular Progress Stats */}
        <div>
          <h3 className="text-white mb-4">Your Progress</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 flex justify-center">
              <CircularProgress 
                value={userProfile.stats.currentStreak} 
                max={userProfile.stats.longestStreak}
                color="#00c2ff"
                label="Current Streak"
                sublabel="days"
              />
            </div>
            <div className="bg-[#1a1a1a] rounded-2xl p-6 border border-white/10 flex justify-center">
              <CircularProgress 
                value={userProfile.stats.completedChallenges} 
                max={userProfile.stats.totalChallenges}
                color="#84cc16"
                label="Completed"
                sublabel={`of ${userProfile.stats.totalChallenges}`}
              />
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div>
          <h3 className="text-white mb-4">Statistics</h3>
          <div className="grid grid-cols-2 gap-3">
            <div className="p-5 rounded-2xl text-white border border-white/10" style={{ backgroundColor: '#00c2ff20' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00c2ff' }}>
                  <TrendingUp className="w-5 h-5 text-black" />
                </div>
              </div>
              <div className="text-3xl mb-1" style={{ color: '#00c2ff' }}>{userProfile.stats.longestStreak}</div>
              <div className="text-sm text-white/60">Longest Streak</div>
            </div>
            <div className="p-5 rounded-2xl text-white border border-white/10" style={{ backgroundColor: '#84cc1620' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#84cc16' }}>
                  <Award className="w-5 h-5 text-black" />
                </div>
              </div>
              <div className="text-3xl mb-1" style={{ color: '#84cc16' }}>{userProfile.stats.totalPoints}</div>
              <div className="text-sm text-white/60">Total Points</div>
            </div>
            <div className="p-5 rounded-2xl text-white border border-white/10" style={{ backgroundColor: '#a855f720' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#a855f7' }}>
                  <Target className="w-5 h-5 text-black" />
                </div>
              </div>
              <div className="text-3xl mb-1" style={{ color: '#a855f7' }}>{userProfile.stats.activeChallenges}</div>
              <div className="text-sm text-white/60">Active Now</div>
            </div>
            <div className="p-5 rounded-2xl text-white border border-white/10" style={{ backgroundColor: '#f9731620' }}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
                  <Trophy className="w-5 h-5 text-black" />
                </div>
              </div>
              <div className="text-3xl mb-1" style={{ color: '#f97316' }}>{userProfile.stats.totalChallenges}</div>
              <div className="text-sm text-white/60">Total Challenges</div>
            </div>
          </div>
        </div>

        {/* Badges */}
        <div>
          <h3 className="text-white mb-4">Badges</h3>
          <div className="grid grid-cols-3 gap-3">
            {userProfile.badges.map((badge, index) => {
              const colors = ['#00c2ff', '#ec4899', '#84cc16', '#a855f7', '#f97316', '#14b8a6'];
              return (
                <div
                  key={badge.id}
                  className={`p-4 text-center rounded-xl border ${
                    badge.earned ? 'border-white/20' : 'border-white/10'
                  } ${badge.earned ? '' : 'opacity-30'}`}
                  style={{ 
                    backgroundColor: badge.earned ? `${colors[index % colors.length]}20` : '#ffffff05' 
                  }}
                >
                  <div className="text-3xl mb-2">{badge.icon}</div>
                  <div className={`text-xs ${badge.earned ? 'text-white' : 'text-white/40'}`}>{badge.name}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Create Group Section */}
        <div>
          <h3 className="text-white mb-4">Your Groups</h3>
          <Card className="p-6 bg-[#1a1a1a] border border-[#00c2ff]/30">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: '#00c2ff20' }}>
                <Users className="w-6 h-6" style={{ color: '#00c2ff' }} />
              </div>
              <div className="flex-1">
                <h4 className="text-white mb-1">Create Your Own Group</h4>
                <p className="text-sm text-white/60">
                  Start your own fitness community and challenge friends together
                </p>
              </div>
            </div>

            <Dialog open={isCreateGroupOpen} onOpenChange={setIsCreateGroupOpen}>
              <DialogTrigger asChild>
                <Button 
                  className="w-full text-black rounded-xl py-6"
                  style={{ backgroundColor: '#00c2ff' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Create New Group
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto bg-[#1a1a1a] border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">Create New Group</DialogTitle>
                  <DialogDescription className="text-white/60">
                    Fill in the details to create your own fitness group
                  </DialogDescription>
                </DialogHeader>
                
                <div className="space-y-5 py-4">
                  {/* Group Name */}
                  <div>
                    <Label className="text-white/80 mb-2 block">Group Name *</Label>
                    <Input
                      value={groupName}
                      onChange={(e) => setGroupName(e.target.value)}
                      placeholder="e.g., Boro Runners"
                      className="border-white/10 bg-white/5 text-white rounded-xl placeholder:text-white/40"
                    />
                  </div>

                  {/* Group Description */}
                  <div>
                    <Label className="text-white/80 mb-2 block">Description *</Label>
                    <Textarea
                      value={groupDescription}
                      onChange={(e) => setGroupDescription(e.target.value)}
                      placeholder="Tell members what your group is about..."
                      className="border-white/10 bg-white/5 text-white rounded-xl min-h-[100px] placeholder:text-white/40"
                    />
                  </div>

                  {/* Brand Color */}
                  <div>
                    <Label className="text-white/80 mb-2 block">Brand Color</Label>
                    <div className="flex items-center gap-3">
                      <input
                        type="color"
                        value={groupBrandColor}
                        onChange={(e) => setGroupBrandColor(e.target.value)}
                        className="w-16 h-12 rounded-xl border-2 border-white/10 cursor-pointer bg-transparent"
                      />
                      <Input
                        value={groupBrandColor}
                        onChange={(e) => setGroupBrandColor(e.target.value)}
                        placeholder="#00c2ff"
                        className="flex-1 border-white/10 bg-white/5 text-white rounded-xl"
                      />
                    </div>
                  </div>

                  {/* Logo Upload */}
                  <div>
                    <Label className="text-white/80 mb-2 block">Group Logo</Label>
                    <div className="flex items-center gap-4">
                      {groupLogo && (
                        <div className="w-20 h-20 rounded-xl overflow-hidden border-2 border-white/10">
                          <img src={groupLogo} alt="Group logo" className="w-full h-full object-cover" />
                        </div>
                      )}
                      <label className="flex-1">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full border-white/10 bg-white/5 text-white rounded-xl hover:bg-white/10"
                        >
                          <Upload className="w-4 h-4 mr-2" />
                          {groupLogo ? 'Change Logo' : 'Upload Logo'}
                        </Button>
                      </label>
                    </div>
                  </div>

                  {/* Total Members */}
                  <div>
                    <Label className="text-white/80 mb-2 block">Total Members *</Label>
                    <Input
                      type="number"
                      value={totalMembers}
                      onChange={(e) => setTotalMembers(e.target.value)}
                      placeholder="e.g., 50"
                      min="1"
                      className="border-white/10 bg-white/5 text-white rounded-xl placeholder:text-white/40"
                    />
                    <p className="text-xs text-white/40 mt-1">
                      Set the maximum number of members for your group
                    </p>
                  </div>

                  {/* Create Button */}
                  <Button
                    onClick={handleCreateGroup}
                    className="w-full text-black rounded-xl py-6 mt-4"
                    style={{ backgroundColor: '#00c2ff' }}
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
                  >
                    Create Group
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </Card>
        </div>
      </div>
    </div>
  );
}
