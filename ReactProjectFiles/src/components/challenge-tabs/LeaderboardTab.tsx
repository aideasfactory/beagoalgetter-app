import { useState } from 'react';
import { Trophy, TrendingUp, Award, Flame, Shield, Users } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '../ui/sheet';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const leaderboardData = [
  { rank: 1, name: 'Emma Williams', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma', streak: 22, points: 310, isPerfect: true, teamId: 't2' },
  { rank: 2, name: 'Sarah Johnson', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah', streak: 15, points: 245, isPerfect: false, teamId: 't2' },
  { rank: 3, name: 'David Rodriguez', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David', streak: 7, points: 95, isPerfect: false, teamId: 't1' },
  { rank: 4, name: 'Alex Kim', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex', streak: 12, points: 180, isPerfect: false, teamId: 't1' },
  { rank: 5, name: 'Jessica Lee', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica', streak: 18, points: 270, isPerfect: false, teamId: 't3' },
  { rank: 6, name: 'Mike Chen', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike', streak: 0, points: 180, isPerfect: false, teamId: 't3' },
];

// Mock team data
const teamsData = [
  { id: 't1', name: 'Team Thunder', color: '#00c2ff', totalPoints: 275, totalStreak: 19, members: 2 },
  { id: 't2', name: 'Team Phoenix', color: '#f97316', totalPoints: 555, totalStreak: 37, members: 2 },
  { id: 't3', name: 'Team Blaze', color: '#84cc16', totalPoints: 450, totalStreak: 18, members: 2 },
];

const streakData = [
  { day: 'Mon', total: 85 },
  { day: 'Tue', total: 92 },
  { day: 'Wed', total: 88 },
  { day: 'Thu', total: 95 },
  { day: 'Fri', total: 90 },
  { day: 'Sat', total: 98 },
  { day: 'Sun', total: 94 },
];

const pointsData = [
  { day: 'W1', points: 450 },
  { day: 'W2', points: 620 },
  { day: 'W3', points: 780 },
  { day: 'W4', points: 1250 },
];

export default function LeaderboardTab() {
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  const topThree = leaderboardData.slice(0, 3);
  const others = leaderboardData.slice(3);

  // Sort teams by total points
  const sortedTeamsByPoints = [...teamsData].sort((a, b) => b.totalPoints - a.totalPoints);
  const sortedTeamsByStreak = [...teamsData].sort((a, b) => b.totalStreak - a.totalStreak);

  const selectedTeam = teamsData.find(team => team.id === selectedTeamId);
  const teamMembers = leaderboardData.filter(user => user.teamId === selectedTeamId);

  const handleTeamClick = (teamId: string) => {
    setSelectedTeamId(teamId);
    setIsSheetOpen(true);
  };

  return (
    <div className="p-4 space-y-6 bg-black">
      {/* Charts Section */}
      <div className="space-y-4">
        <h3 className="text-white">Group Performance</h3>

        {/* Total Daily Completion */}
        <div className="p-5 rounded-2xl text-white border border-white/10" style={{ backgroundColor: '#1a1a1a' }}>
          <h4 className="text-white mb-3">Daily Completion Rate (%)</h4>
          <ResponsiveContainer width="100%" height={180}>
            <AreaChart data={streakData}>
              <defs>
                <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#00c2ff" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#00c2ff" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#ffffff'
                }}
              />
              <Area type="monotone" dataKey="total" stroke="#00c2ff" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Total Ability Points */}
        <div className="p-5 rounded-2xl text-white border border-white/10" style={{ backgroundColor: '#1a1a1a' }}>
          <h4 className="text-white mb-3">Cumulative Ability Points</h4>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={pointsData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis dataKey="day" stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
              <YAxis stroke="rgba(255,255,255,0.6)" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1a1a1a', 
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  color: '#ffffff'
                }}
              />
              <Bar dataKey="points" fill="#00c2ff" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Team Leaderboard */}
      <div>
        <h3 className="text-white mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5" style={{ color: '#00c2ff' }} />
          Team Standings
        </h3>

        

        {/* All Teams Rankings */}
        <div className="space-y-2">
          {sortedTeamsByPoints.map((team, index) => (
            <button
              key={team.id}
              onClick={() => handleTeamClick(team.id)}
              className="w-full bg-[#1a1a1a] rounded-xl p-4 border-2 flex items-center justify-between hover:bg-white/5 transition-colors cursor-pointer"
              style={{ borderColor: team.color + '40' }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center text-black"
                  style={{ backgroundColor: team.color }}
                >
                  #{index + 1}
                </div>
                <div>
                  <div className="text-white text-left">{team.name}</div>
                  <div className="flex items-center gap-3 text-xs text-white/60 mt-1">
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {team.members} members
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="flex items-center gap-4">
                  <div>
                    <div className="flex items-center justify-end gap-1 text-white">
                      <Flame className="w-4 h-4 text-orange-500" />
                      <span>{team.totalStreak}</span>
                    </div>
                    <div className="text-xs text-white/60">Streak</div>
                  </div>
                  <div>
                    <div className="flex items-center justify-end gap-1 text-white">
                      <Award className="w-4 h-4" style={{ color: '#00c2ff' }} />
                      <span>{team.totalPoints}</span>
                    </div>
                    <div className="text-xs text-white/60">Points</div>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Team Details Sheet */}
      <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
        <SheetContent side="bottom" className="h-[80vh] rounded-t-3xl bg-[#1a1a1a] border-white/10">
          {selectedTeam && (
            <>
              <SheetHeader className="pb-4 border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div 
                    className="w-16 h-16 rounded-full flex items-center justify-center text-black"
                    style={{ backgroundColor: selectedTeam.color }}
                  >
                    <Shield className="w-8 h-8" />
                  </div>
                  <div>
                    <SheetTitle className="text-white">{selectedTeam.name}</SheetTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-white/60">
                      <span className="flex items-center gap-1">
                        <Users className="w-4 h-4" />
                        {selectedTeam.members} members
                      </span>
                      <span className="flex items-center gap-1">
                        <Flame className="w-4 h-4 text-orange-500" />
                        {selectedTeam.totalStreak} total streak
                      </span>
                      <span className="flex items-center gap-1">
                        <Award className="w-4 h-4" style={{ color: '#00c2ff' }} />
                        {selectedTeam.totalPoints} total points
                      </span>
                    </div>
                  </div>
                </div>
              </SheetHeader>

              <div className="mt-6 space-y-3 overflow-y-auto max-h-[calc(80vh-180px)] p-4">
                <h4 className="text-white mb-3">Team Members</h4>
                {teamMembers.length > 0 ? (
                  teamMembers.map((member) => (
                    <div
                      key={member.rank}
                      className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-4">
                        <Avatar className="w-12 h-12 ring-2" style={{ ringColor: selectedTeam.color }}>
                          <AvatarImage src={member.avatar} />
                          <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-white">{member.name}</div>
                          <div className="text-xs text-white/60 mt-1">
                            Rank #{member.rank} Overall
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-white">
                            <Flame className="w-4 h-4 text-orange-500" />
                            <span>{member.streak}</span>
                          </div>
                          <div className="text-xs text-white/60">Streak</div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center justify-end gap-1 text-white">
                            <Award className="w-4 h-4" style={{ color: '#00c2ff' }} />
                            <span>{member.points}</span>
                          </div>
                          <div className="text-xs text-white/60">Points</div>
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-white/40">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-30" />
                    <p>No members in this team</p>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Individual Leaderboard */}
      <div>
        <h3 className="text-white mb-4">Individual Leaderboard</h3>

        {/* Top 3 Podium */}
        <div className="flex items-end justify-center gap-2 mb-6">
          {/* 2nd Place */}
          <div className="flex-1 flex flex-col items-center">
            <Badge variant="secondary" className="mb-2 bg-white/10 text-white border-0">
              #2
            </Badge>
            <Avatar className="w-16 h-16 mb-2 ring-4 ring-white/20">
              <AvatarImage src={topThree[1].avatar} />
              <AvatarFallback>{topThree[1].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="rounded-t-xl p-3 w-full text-center border border-white/20 h-24 flex flex-col justify-center" style={{ backgroundColor: '#2a2a2a' }}>
              <div className="text-xs text-white/60 mb-1">{topThree[1].name.split(' ')[0]}</div>
              <div className="flex items-center justify-center gap-1 text-white">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs">{topThree[1].streak}</span>
              </div>
              <div className="text-xs text-white/60 mt-1">{topThree[1].points} AP</div>
            </div>
          </div>

          {/* 1st Place */}
          <div className="flex-1 flex flex-col items-center">
            <Badge className="mb-2 border-0" style={{ backgroundColor: '#00c2ff', color: '#000' }}>
              <Trophy className="w-3 h-3 mr-1" />
              #1
            </Badge>
            <Avatar className="w-20 h-20 mb-2 ring-4" style={{ ringColor: '#00c2ff' }}>
              <AvatarImage src={topThree[0].avatar} />
              <AvatarFallback>{topThree[0].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="rounded-t-xl p-3 w-full text-center border h-32 flex flex-col justify-center" style={{ backgroundColor: '#00c2ff20', borderColor: '#00c2ff40' }}>
              <div className="text-xs text-white/60 mb-1">{topThree[0].name.split(' ')[0]}</div>
              <div className="flex items-center justify-center gap-1 text-white">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>{topThree[0].streak}</span>
              </div>
              <div className="text-xs text-white/60 mt-1">{topThree[0].points} AP</div>
              {topThree[0].isPerfect && (
                <Badge variant="secondary" className="mt-2 text-xs bg-white/10 text-white border-0">
                  Perfect! 🎯
                </Badge>
              )}
            </div>
          </div>

          {/* 3rd Place */}
          <div className="flex-1 flex flex-col items-center">
            <Badge variant="secondary" className="mb-2 bg-orange-500/20 text-orange-500 border-0">
              #3
            </Badge>
            <Avatar className="w-16 h-16 mb-2 ring-4 ring-orange-500/20">
              <AvatarImage src={topThree[2].avatar} />
              <AvatarFallback>{topThree[2].name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="rounded-t-xl p-3 w-full text-center border border-orange-500/20 h-20 flex flex-col justify-center" style={{ backgroundColor: '#f9731620' }}>
              <div className="text-xs text-white/60 mb-1">{topThree[2].name.split(' ')[0]}</div>
              <div className="flex items-center justify-center gap-1 text-white">
                <Flame className="w-3 h-3 text-orange-500" />
                <span className="text-xs">{topThree[2].streak}</span>
              </div>
              <div className="text-xs text-white/60 mt-1">{topThree[2].points} AP</div>
            </div>
          </div>
        </div>

        {/* Other Rankings */}
        <div className="space-y-2">
          {others.map((user) => (
            <div
              key={user.rank}
              className="bg-[#1a1a1a] rounded-xl p-4 border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 text-center text-white/40">
                  #{user.rank}
                </div>
                <Avatar className="w-10 h-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <div className="text-white">{user.name}</div>
                  <div className="flex items-center gap-3 text-xs text-white/60">
                    <span className="flex items-center gap-1">
                      <Flame className="w-3 h-3 text-orange-500" />
                      {user.streak} days
                    </span>
                    <span className="flex items-center gap-1">
                      <Award className="w-3 h-3" style={{ color: '#00c2ff' }} />
                      {user.points} AP
                    </span>
                  </div>
                </div>
              </div>
              {user.isPerfect && (
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-500 text-xs border-0">
                  Perfect
                </Badge>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
