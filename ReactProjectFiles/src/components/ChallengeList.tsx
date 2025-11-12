import { Plus, Filter, TrendingUp, Calendar, Users, Flame } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface ChallengeListProps {
  onChallengeClick: (challengeId: string) => void;
  onCreateClick: () => void;
}

const challenges = [
  {
    id: 'c1',
    title: '30-Day Fitness Challenge',
    description: 'Daily workouts and healthy habits',
    image: 'https://images.unsplash.com/photo-1758684050596-15a238d24202?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwbW90aXZhdGlvbiUyMHJ1bm5lcnxlbnwxfHx8fDE3NjE5MTIxMjN8MA&ixlib=rb-4.1.0&q=80&w=400',
    type: 'Group',
    progress: 50,
    daysCompleted: 15,
    totalDays: 30,
    currentStreak: 15,
    members: 12,
    status: 'active',
    endDate: 'Nov 30, 2025',
  },
  {
    id: 'c2',
    title: 'Read 20 Pages Daily',
    description: 'Build a consistent reading habit',
    image: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400',
    type: 'Personal',
    progress: 27,
    daysCompleted: 8,
    totalDays: 30,
    currentStreak: 0,
    members: 1,
    status: 'active',
    endDate: 'Nov 30, 2025',
  },
  {
    id: 'c3',
    title: 'No Sugar November',
    description: 'Eliminate added sugars for 30 days',
    image: 'https://images.unsplash.com/photo-1490645935967-10de6ba17061?w=400',
    type: 'Team',
    progress: 73,
    daysCompleted: 22,
    totalDays: 30,
    currentStreak: 22,
    members: 8,
    status: 'active',
    endDate: 'Nov 30, 2025',
  },
  {
    id: 'c4',
    title: 'Morning Meditation',
    description: '10 minutes of mindfulness each morning',
    image: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=400',
    type: 'Personal',
    progress: 100,
    daysCompleted: 21,
    totalDays: 21,
    currentStreak: 21,
    members: 1,
    status: 'completed',
    endDate: 'Oct 21, 2025',
  },
];

export default function ChallengeList({ onChallengeClick, onCreateClick }: ChallengeListProps) {
  const activeChallenges = challenges.filter(c => c.status === 'active');
  const completedChallenges = challenges.filter(c => c.status === 'completed');

  const ChallengeCard = ({ challenge, index }: { challenge: typeof challenges[0], index: number }) => (
    <button
      onClick={() => onChallengeClick(challenge.id)}
      className="w-full text-left rounded-2xl overflow-hidden transition-all hover:scale-[1.02] bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 hover:border-white/20"
    >
      {/* Image Header */}
      <div className="relative h-40 overflow-hidden">
        <img 
          src={challenge.image} 
          alt={challenge.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent" />
        
        {/* Badges on image */}
        <div className="absolute top-3 left-3 right-3 flex items-start justify-between">
          <Badge 
            variant="secondary" 
            className="bg-white/20 text-white backdrop-blur-md border-0"
          >
            {challenge.type}
          </Badge>
          {challenge.members > 1 && (
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md rounded-full px-2.5 py-1 text-sm text-white">
              <Users className="w-3.5 h-3.5" />
              <span>{challenge.members}</span>
            </div>
          )}
        </div>

        {/* Title overlay on image */}
        <div className="absolute bottom-3 left-3 right-3">
          <h3 className="text-white mb-1">{challenge.title}</h3>
          <p className="text-white/70 text-sm line-clamp-1">{challenge.description}</p>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Progress */}
        <div className="space-y-2 mb-4">
          <div className="flex justify-between text-sm">
            <span className="text-white/60">Progress</span>
            <span className="text-white">{challenge.daysCompleted}/{challenge.totalDays} days</span>
          </div>
          <div className="h-2 bg-white/10 rounded-full overflow-hidden">
            <div 
              className="h-full rounded-full transition-all"
              style={{ 
                width: `${challenge.progress}%`,
                backgroundColor: challenge.status === 'completed' ? '#10b981' : '#00c2ff'
              }}
            />
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-1.5 text-white/80">
            {challenge.currentStreak > 0 ? (
              <>
                <Flame className="w-4 h-4" style={{ color: '#f97316' }} />
                <span>{challenge.currentStreak} day streak</span>
              </>
            ) : (
              <>
                <TrendingUp className="w-4 h-4 text-white/40" />
                <span className="text-white/60">No streak</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-1.5 text-white/60">
            <Calendar className="w-4 h-4" />
            <span className="text-xs">{challenge.endDate}</span>
          </div>
        </div>

        {/* Completed Badge */}
        {challenge.status === 'completed' && (
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="flex items-center justify-center gap-2 text-sm" style={{ color: '#10b981' }}>
              <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ backgroundColor: '#10b98120' }}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
              <span>Completed</span>
            </div>
          </div>
        )}
      </div>
    </button>
  );

  return (
    <div className="min-h-screen bg-black pb-6">
      {/* Top Navigation */}
      <div className="sticky top-0 bg-black/90 backdrop-blur-xl border-b border-white/10 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            <h1 className="text-white">My Challenges</h1>
            <button className="p-2 hover:bg-white/10 rounded-full transition-colors">
              <Filter className="w-5 h-5 text-white" />
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* Tabs */}
        <Tabs defaultValue="active" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-white/5 border border-white/10 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger 
              value="active" 
              className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
            >
              Active ({activeChallenges.length})
            </TabsTrigger>
            <TabsTrigger 
              value="completed" 
              className="rounded-lg data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
            >
              Completed ({completedChallenges.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="active" className="space-y-4">
            {activeChallenges.length > 0 ? (
              activeChallenges.map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <TrendingUp className="w-8 h-8 text-white/40" />
                </div>
                <h3 className="text-white mb-2">No Active Challenges</h3>
                <p className="text-white/60 text-sm mb-6">
                  Start a new challenge to track your goals
                </p>
                <Button
                  onClick={onCreateClick}
                  className="text-black"
                  style={{ backgroundColor: '#00c2ff' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Create Challenge
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="completed" className="space-y-4">
            {completedChallenges.length > 0 ? (
              completedChallenges.map((challenge, index) => (
                <ChallengeCard key={challenge.id} challenge={challenge} index={index} />
              ))
            ) : (
              <div className="text-center py-16 px-4">
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-white mb-2">No Completed Challenges</h3>
                <p className="text-white/60 text-sm">
                  Complete your active challenges to see them here
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Floating Action Button */}
      <button
        onClick={onCreateClick}
        className="fixed bottom-24 right-6 w-14 h-14 text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-110"
        style={{ backgroundColor: '#00c2ff' }}
        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
      >
        <Plus className="w-6 h-6" />
      </button>
    </div>
  );
}
