import { useState } from 'react';
import { ArrowLeft, BarChart3, CheckSquare, MessageSquare, TrendingUp, Users, Calendar, Award, Share2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import LeaderboardTab from './challenge-tabs/LeaderboardTab';
import TaskTrackerTab from './challenge-tabs/TaskTrackerTab';
import MessagesTab from './challenge-tabs/MessagesTab';
import { Progress } from './ui/progress';
import { Badge } from './ui/badge';

interface ChallengeDetailsProps {
  challengeId: string | null;
  onBack: () => void;
}

// Mock challenge data
const challengeData = {
  id: 'c1',
  title: '30-Day Fitness Challenge',
  description: 'Build consistency with daily workouts and healthy habits. Track your progress, stay accountable, and achieve your fitness goals together!',
  image: 'https://images.unsplash.com/photo-1758520705189-a6b56a7ae832?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwcnVubmluZyUyMG1vdGl2YXRpb258ZW58MXx8fHwxNzYyMjg5MTg4fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral',
  type: 'Group',
  progress: 50,
  daysCompleted: 15,
  totalDays: 30,
  currentStreak: 15,
  members: 12,
  startDate: 'Oct 1, 2025',
  endDate: 'Oct 30, 2025',
  totalPoints: 1250,
};

export default function ChallengeDetails({ challengeId, onBack }: ChallengeDetailsProps) {
  const [activeTab, setActiveTab] = useState('leaderboard');

  return (
    <div className="min-h-screen bg-black">
      {/* Hero Image Header with Stats Overlay */}
      <div className="relative h-[60vh] min-h-[500px] overflow-hidden">
        {/* Background Image */}
        <img
          src={challengeData.image}
          alt={challengeData.title}
          className="w-full h-full object-cover"
        />
        
        {/* Dark Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black" />

        {/* Top Actions */}
        <div className="absolute top-0 left-0 right-0 px-4 py-6 flex items-center justify-between z-10">
          <button
            onClick={onBack}
            className="w-10 h-10 bg-black/50 backdrop-blur-md hover:bg-black/70 rounded-full flex items-center justify-center transition-all border border-white/10"
          >
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          
          <button className="w-10 h-10 bg-black/50 backdrop-blur-md hover:bg-black/70 rounded-full flex items-center justify-center transition-all border border-white/10">
            <Share2 className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Challenge Title and Type */}
        <div className="absolute top-20 left-0 right-0 px-6 z-10">
          <Badge className="bg-white/10 text-white backdrop-blur-md border border-white/20 mb-3">
            {challengeData.type} • {challengeData.members} members
          </Badge>
          <h1 className="text-white mb-2 drop-shadow-lg">{challengeData.title}</h1>
        </div>

        {/* Stats Overlay - Bottom of Hero */}
        <div className="absolute bottom-0 left-0 right-0 px-6 pb-8 z-10">
          <div className="grid grid-cols-4 gap-3">
            {/* Streak */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#00c2ff' }}>
                <TrendingUp className="w-5 h-5 text-black" />
              </div>
              <div className="text-white mb-1">{challengeData.currentStreak}</div>
              <div className="text-xs text-white/80">Streak</div>
            </div>

            {/* Points */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#84cc16' }}>
                <Award className="w-5 h-5 text-black" />
              </div>
              <div className="text-white mb-1">{challengeData.totalPoints}</div>
              <div className="text-xs text-white/80">Points</div>
            </div>

            {/* Members */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#a855f7' }}>
                <Users className="w-5 h-5 text-black" />
              </div>
              <div className="text-white mb-1">{challengeData.members}</div>
              <div className="text-xs text-white/80">Active</div>
            </div>

            
            {/* Days Left */}
            <div className="bg-black/40 backdrop-blur-md rounded-2xl p-4 text-center border border-white/20">
              <div className="w-10 h-10 rounded-xl mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: '#f97316' }}>
                <Calendar className="w-5 h-5 text-black" />
              </div>
              <div className="text-white mb-1">{challengeData.totalDays - challengeData.daysCompleted}</div>
              <div className="text-xs text-white/80">Remaining</div>
            </div>

          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="relative bg-black">
        {/* Progress Bar */}
        <div className="px-6 pt-6 pb-4">
          <div className="max-w-2xl mx-auto">
            <div className="mb-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-white/60">Overall Progress</span>
                <span style={{ color: '#00c2ff' }}>{challengeData.daysCompleted}/{challengeData.totalDays} days</span>
              </div>
              <div className="h-3 bg-white/10 rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all"
                  style={{ width: `${challengeData.progress}%`, backgroundColor: '#00c2ff' }}
                />
              </div>
            </div>

            <p className="text-white/60 text-sm leading-relaxed">{challengeData.description}</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="sticky top-0 bg-black border-b border-white/10 z-30">
              <TabsList className="w-full grid grid-cols-3 bg-transparent rounded-none h-auto p-0">
                <TabsTrigger 
                  value="leaderboard" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent py-4 data-[state=active]:text-white text-white/60"
                  style={{ borderBottomColor: activeTab === 'leaderboard' ? '#00c2ff' : 'transparent' }}
                >
                  <BarChart3 className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Leaderboard</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="tasks" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent py-4 data-[state=active]:text-white text-white/60"
                  style={{ borderBottomColor: activeTab === 'tasks' ? '#00c2ff' : 'transparent' }}
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Tasks</span>
                </TabsTrigger>
                <TabsTrigger 
                  value="messages" 
                  className="rounded-none border-b-2 border-transparent data-[state=active]:bg-transparent py-4 data-[state=active]:text-white text-white/60"
                  style={{ borderBottomColor: activeTab === 'messages' ? '#00c2ff' : 'transparent' }}
                >
                  <MessageSquare className="w-4 h-4 mr-2" />
                  <span className="hidden sm:inline">Messages</span>
                </TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="leaderboard" className="mt-0">
              <LeaderboardTab />
            </TabsContent>

            <TabsContent value="tasks" className="mt-0">
              <TaskTrackerTab />
            </TabsContent>

            <TabsContent value="messages" className="mt-0">
              <MessagesTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
