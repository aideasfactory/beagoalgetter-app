import { useState } from "react";
import {
  Bell,
  Heart,
  Award,
  TrendingUp,
  Target,
  Users,
  MapPin,
  Calendar,
} from "lucide-react";
import logo from 'figma:asset/ae280b92ceef7e198522f0872d65dd755e21ef9b.png';
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Button } from "./ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "./ui/sheet";
import { Badge } from "./ui/badge";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "./ui/avatar";
import {
  Tabs,
  TabsList,
  TabsTrigger,
  TabsContent,
} from "./ui/tabs";
import { toast } from "sonner@2.0.3";

interface HomePageProps {
  onChallengeClick: (challengeId: string) => void;
}

// Mock notifications data
const notifications = [
  {
    id: "n1",
    type: "like",
    user: { name: "Emma Williams", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
    message: "liked your post",
    post: "Completed Day 15! Morning run + strength training ✓",
    timestamp: "5 minutes ago",
    read: false,
  },
  {
    id: "n2",
    type: "points",
    user: { name: "David Rodriguez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    message: "gave you 10 ability points",
    post: "Week 1 done! Consistency is key 💪",
    timestamp: "1 hour ago",
    read: false,
  },
  {
    id: "n3",
    type: "challenge",
    message: "New challenge starting tomorrow: 30-Day Fitness Challenge",
    timestamp: "2 hours ago",
    read: true,
  },
  {
    id: "n4",
    type: "streak",
    message: "🔥 You're on a 15-day streak! Keep it up!",
    timestamp: "1 day ago",
    read: true,
  },
  {
    id: "n5",
    type: "like",
    user: { name: "Mike Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
    message: "liked your post",
    post: "No Sugar November - Day 22 complete!",
    timestamp: "1 day ago",
    read: true,
  },
];

// Mock group data
const boroRunnersGroup = {
  name: "Boro Runners",
  logo: "🏃",
  color: "#991b1b",
  description: "A community of passionate runners from Middlesbrough committed to staying active, supporting each other, and crushing fitness goals together. Whether you're training for your first 5K or your tenth marathon, we're here to motivate and inspire!",
  members: 247,
  challenges: 12,
  founded: "January 2024",
  location: "Middlesbrough, UK",
  stats: {
    totalRuns: 1842,
    totalDistance: "12,438 km",
    activeMembers: 189,
  },
  recentMembers: [
    { name: "Sarah Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
    { name: "David Rodriguez", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=David" },
    { name: "Emma Williams", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
    { name: "Mike Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
  ],
};

// Mock data
const feedPosts = [
  {
    id: "1",
    user: {
      name: "Sarah Johnson",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      streak: 15,
      abilityPoints: 245,
    },
    challenge: {
      id: "c1",
      name: "30-Day Fitness Challenge",
      type: "Group",
      members: 12,
    },
    group: {
      name: "Boro Runners",
      logo: "🏃",
      color: "#991b1b",
    },
    type: "success" as const,
    message:
      "Completed Day 15! Morning run + strength training ✓",
    image:
      "https://images.unsplash.com/photo-1758684050596-15a238d24202?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXRuZXNzJTIwbW90aXZhdGlvbiUyMHJ1bm5lcnxlbnwxfHx8fDE3NjE5MTIxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    note: "Felt amazing today! The morning run was tough but worth it.",
    timestamp: "2 hours ago",
    likes: 23,
    abilityPointsGiven: 5,
  },
  {
    id: "2",
    user: {
      name: "Mike Chen",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      streak: 0,
      abilityPoints: 180,
    },
    challenge: {
      id: "c2",
      name: "Read 20 Pages Daily",
      type: "Personal",
      members: 1,
    },
    type: "fail" as const,
    message: "Missed Day 8 - Streak reset to 0",
    timestamp: "5 hours ago",
    likes: 8,
    abilityPointsGiven: 0,
  },
  {
    id: "3",
    user: {
      name: "Emma Williams",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      streak: 22,
      abilityPoints: 310,
    },
    challenge: {
      id: "c3",
      name: "No Sugar November",
      type: "Team",
      members: 8,
    },
    type: "success" as const,
    message:
      "Day 22 complete! Resisted birthday cake at the office 🎉",
    timestamp: "1 day ago",
    likes: 45,
    abilityPointsGiven: 12,
  },
  {
    id: "4",
    user: {
      name: "David Rodriguez",
      avatar:
        "https://api.dicebear.com/7.x/avataaars/svg?seed=David",
      streak: 7,
      abilityPoints: 95,
    },
    challenge: {
      id: "c1",
      name: "30-Day Fitness Challenge",
      type: "Group",
      members: 12,
    },
    group: {
      name: "Boro Runners",
      logo: "🏃",
      color: "#991b1b",
    },
    type: "success" as const,
    message: "Week 1 done! Consistency is key 💪",
    image:
      "https://images.unsplash.com/photo-1689007669034-9ef988d89742?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdGhsZXRlJTIwd29ya291dCUyMGd5bXxlbnwxfHx8fDE3NjE5MTIxMjN8MA&ixlib=rb-4.1.0&q=80&w=1080",
    timestamp: "1 day ago",
    likes: 31,
    abilityPointsGiven: 8,
  },
];

export default function HomePage({
  onChallengeClick,
}: HomePageProps) {
  const [selectedChallenge, setSelectedChallenge] =
    useState<any>(null);
  const [activeTab, setActiveTab] = useState("all");
  const [givePointsPost, setGivePointsPost] =
    useState<any>(null);
  const [selectedPoints, setSelectedPoints] = useState(5);
  const [showNotifications, setShowNotifications] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState<any>(null);

  const handleChallengeClick = (challenge: any) => {
    setSelectedChallenge(challenge);
  };

  const handleViewChallenge = () => {
    if (selectedChallenge) {
      onChallengeClick(selectedChallenge.id);
      setSelectedChallenge(null);
    }
  };

  const handleGivePoints = (post: any) => {
    setGivePointsPost(post);
    setSelectedPoints(5);
  };

  const confirmGivePoints = () => {
    if (givePointsPost) {
      toast.success(
        `Gave ${selectedPoints} ability points to ${givePointsPost.user.name}!`,
      );
      setGivePointsPost(null);
    }
  };

  // Filter posts based on active tab
  // For "my-challenges" tab, only show posts from challenges the user is in (c1, c3 for demo)
  const userChallengeIds = ["c1", "c3"];
  const filteredPosts =
    activeTab === "all"
      ? feedPosts
      : feedPosts.filter((post) =>
          userChallengeIds.includes(post.challenge.id),
        );



  return (
    <div className="min-h-screen bg-black">
      {/* Top Navigation */}
      <div className="sticky top-0 bg-black border-b border-white/10 z-40 backdrop-blur-xl">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between max-w-2xl mx-auto">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src={logo} alt="Goal Getter" className="w-40" />
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={() => setShowNotifications(true)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors relative"
              >
                <Bell className="w-5 h-5 text-white" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full" style={{ backgroundColor: '#00c2ff' }}></span>
              </button>
            </div>
          </div>
        </div>

        {/* Tabs for filtering */}
        <div className="px-4 pb-3 max-w-2xl mx-auto">
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="w-full bg-white/5 border-white/10">
              <TabsTrigger
                value="all"
                className="flex-1 data-[state=active]:text-black text-white/60"
                style={{ 
                  backgroundColor: activeTab === 'all' ? '#00c2ff' : 'transparent' 
                }}
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="my-challenges"
                className="flex-1 data-[state=active]:text-black text-white/60"
                style={{ 
                  backgroundColor: activeTab === 'my-challenges' ? '#00c2ff' : 'transparent' 
                }}
              >
                My Challenges
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Feed */}
      <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
        {filteredPosts.map((post, index) => (
          <div
            key={post.id}
            className="rounded-2xl overflow-hidden relative bg-[#1a1a1a] border border-white/10"
          >
            {/* Completion Indicator - Top Right Corner Ribbon */}
            <div className="absolute top-0 right-0 z-10 overflow-hidden w-24 h-24 pointer-events-none">
              <div
                className="absolute top-5 -right-10 w-40 text-center shadow-lg transform rotate-45 py-1"
                style={{ 
                  backgroundColor: post.type === "success" ? "#00c2ff" : "#ef4444"
                }}
              >
                <span className="text-black text-xs uppercase tracking-wider">
                  {post.type === "success"
                    ? "✓ Done"
                    : "✗ Failed"}
                </span>
              </div>
            </div>

            {/* Post Header */}
            <div className="p-5">
              {/* Group Banner - if post has a group */}
              {post.group && (
                <button
                  onClick={() => setSelectedGroup(boroRunnersGroup)}
                  className="mb-4 -mx-5 -mt-5 p-3 border-b border-white/10 w-[calc(100%+2.5rem)] text-left hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: post.group.color }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-2xl shadow-lg">
                        {post.group.logo}
                      </div>
                      <div>
                        <div className="text-white text-sm">
                          Challenge by
                        </div>
                        <div className="text-white">
                          {post.group.name}
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              )}

              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12 ring-2 ring-white/10">
                    <AvatarImage src={post.user.avatar} />
                    <AvatarFallback>
                      {post.user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-white">
                        {post.user.name}
                      </span>
                      <Badge
                        variant="secondary"
                        className="bg-white/10 text-white border-0 text-xs"
                      >
                        {post.user.streak}🔥
                      </Badge>
                    </div>
                    <button
                      onClick={() =>
                        handleChallengeClick(post.challenge)
                      }
                      className="text-sm text-white/60 hover:text-white/80 transition-colors text-left underline"
                    >
                      {post.challenge.name}
                    </button>
                  </div>
                </div>
              </div>

              {/* Post Message */}
              <p className="text-white mb-3">{post.message}</p>

              {/* Post Note */}
              {post.note && (
                <p className="text-sm text-white/60 italic mb-3">
                  {post.note}
                </p>
              )}

              {/* Post Image */}
              {post.image && (
                <div className="rounded-xl overflow-hidden mb-3 ring-2 ring-white/10">
                  <ImageWithFallback
                    src={post.image}
                    alt="Post image"
                    className="w-full h-64 object-cover"
                  />
                </div>
              )}

              {/* Post Actions */}
              <div className="flex items-center gap-6 pt-3 border-t border-white/10">
                <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors">
                  <Heart className="w-5 h-5" />
                  <span className="text-sm">{post.likes}</span>
                </button>
                <button
                  onClick={() => handleGivePoints(post)}
                  className="flex items-center gap-2 text-white/60 hover:text-white transition-colors"
                >
                  <Award className="w-5 h-5" />
                  <span className="text-sm">Give Points</span>
                </button>
                {post.abilityPointsGiven > 0 && (
                  <span className="flex items-center gap-1 text-sm px-2 py-1 rounded-full" style={{ backgroundColor: '#00c2ff20', color: '#00c2ff' }}>
                    <TrendingUp className="w-4 h-4" />+
                    {post.abilityPointsGiven} AP
                  </span>
                )}
                <span className="text-xs text-white/40">
                  {post.timestamp}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Challenge Details Sheet */}
      <Sheet
        open={selectedChallenge !== null}
        onOpenChange={() => setSelectedChallenge(null)}
      >
        <SheetContent
          side="bottom"
          className="h-[80vh] rounded-t-3xl bg-[#1a1a1a] border-white/10"
        >
          <SheetHeader>
            <SheetTitle className="text-white">{selectedChallenge?.name}</SheetTitle>
            <SheetDescription className="text-white/60">
              {selectedChallenge?.type} Challenge •{" "}
              {selectedChallenge?.members} members
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-4">
            <div
              className="rounded-xl p-6 shadow-lg text-white"
              style={{ backgroundColor: "#14b8a6" }}
            >
              <h3 className="text-white mb-2">
                Challenge Details
              </h3>
              <p className="text-white/90 text-sm">
                Join your teammates in completing daily tasks
                and building consistent habits. Track your
                progress, earn ability points, and celebrate
                wins together!
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <div className="mb-1" style={{ color: '#00c2ff' }}>
                  Duration
                </div>
                <div className="text-white">30 Days</div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <div className="mb-1" style={{ color: '#00c2ff' }}>
                  Active
                </div>
                <div className="text-white">
                  {selectedChallenge?.members}
                </div>
              </div>
              <div className="bg-white/5 rounded-xl p-4 border border-white/10 text-center">
                <div className="mb-1" style={{ color: '#00c2ff' }}>
                  Completed
                </div>
                <div className="text-white">45%</div>
              </div>
            </div>

            <Button
              onClick={handleViewChallenge}
              className="w-full text-black py-6 rounded-xl"
              style={{ backgroundColor: '#00c2ff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
            >
              View Challenge
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Give Points Sheet */}
      <Sheet
        open={givePointsPost !== null}
        onOpenChange={() => setGivePointsPost(null)}
      >
        <SheetContent
          side="bottom"
          className="h-[60vh] rounded-t-3xl bg-[#1a1a1a] border-white/10"
        >
          <SheetHeader>
            <SheetTitle className="text-white">Give Ability Points</SheetTitle>
            <SheetDescription className="text-white/60">
              Reward {givePointsPost?.user.name} for their
              achievement
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-6 mx-6">
            {/* User Info */}
            <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
              <Avatar className="w-16 h-16">
                <AvatarImage
                  src={givePointsPost?.user.avatar}
                />
                <AvatarFallback>
                  {givePointsPost?.user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-white">
                  {givePointsPost?.user.name}
                </div>
                <div className="text-sm text-white/60">
                  {givePointsPost?.challenge.name}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge
                    variant="secondary"
                    className="bg-white/10 text-white text-xs border-0"
                  >
                    {givePointsPost?.user.streak}🔥 Streak
                  </Badge>
                  <Badge
                    variant="secondary"
                    className="text-xs border-0"
                    style={{ backgroundColor: '#00c2ff20', color: '#00c2ff' }}
                  >
                    {givePointsPost?.user.abilityPoints} AP
                  </Badge>
                </div>
              </div>
            </div>

            {/* Points Selection */}
            <div className="space-y-3 mx-6">
              <label className="text-sm text-white/60">
                Select Points to Give
              </label>
              <div className="grid grid-cols-5 gap-2">
                {[1, 3, 5, 10, 15].map((points) => (
                  <button
                    key={points}
                    onClick={() => setSelectedPoints(points)}
                    className="py-3 rounded-xl text-center border-2 transition-all"
                    style={
                      selectedPoints === points
                        ? { borderColor: '#00c2ff', backgroundColor: '#00c2ff20', color: '#00c2ff' }
                        : { borderColor: '#ffffff20', backgroundColor: '#ffffff05', color: '#ffffff' }
                    }
                  >
                    {points}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            <div className="p-4 rounded-xl border" style={{ backgroundColor: '#00c2ff20', borderColor: '#00c2ff40' }}>
              <div className="flex items-center justify-between">
                <span className="text-sm text-white/60">
                  Points to give:
                </span>
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5" style={{ color: '#00c2ff' }} />
                  <span style={{ color: '#00c2ff' }}>
                    +{selectedPoints} AP
                  </span>
                </div>
              </div>
            </div>

            {/* Confirm Button */}
            <Button
              onClick={confirmGivePoints}
              className="w-full text-black py-6 rounded-xl"
              style={{ backgroundColor: '#00c2ff' }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#00a8e0'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#00c2ff'}
            >
              Confirm & Give Points
            </Button>
          </div>
        </SheetContent>
      </Sheet>

      {/* Notifications Sheet */}
      <Sheet
        open={showNotifications}
        onOpenChange={setShowNotifications}
      >
        <SheetContent
          side="bottom"
          className="h-[80vh] rounded-t-3xl bg-[#1a1a1a] border-white/10"
        >
          <SheetHeader>
            <SheetTitle className="text-white">Notifications</SheetTitle>
            <SheetDescription className="text-white/60">
              Stay updated with your challenges and achievements
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-2 overflow-y-auto max-h-[calc(80vh-120px)]">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="p-4 rounded-xl border transition-colors"
                style={
                  notification.read
                    ? { backgroundColor: '#ffffff05', borderColor: '#ffffff10' }
                    : { backgroundColor: '#00c2ff20', borderColor: '#00c2ff40' }
                }
              >
                <div className="flex items-start gap-3">
                  {notification.user ? (
                    <Avatar className="w-10 h-10">
                      <AvatarImage src={notification.user.avatar} />
                      <AvatarFallback>
                        {notification.user.name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: '#00c2ff' }}>
                      {notification.type === "challenge" ? (
                        <Target className="w-5 h-5 text-black" />
                      ) : (
                        <Award className="w-5 h-5 text-black" />
                      )}
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-white text-sm">
                      {notification.user && (
                        <span className="font-medium">
                          {notification.user.name}{" "}
                        </span>
                      )}
                      {notification.message}
                    </p>
                    {notification.post && (
                      <p className="text-white/60 text-xs mt-1 italic">
                        "{notification.post}"
                      </p>
                    )}
                    <p className="text-white/40 text-xs mt-2">
                      {notification.timestamp}
                    </p>
                  </div>
                  {!notification.read && (
                    <div className="w-2 h-2 rounded-full mt-2" style={{ backgroundColor: '#00c2ff' }}></div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </SheetContent>
      </Sheet>

      {/* Group Information Sheet */}
      <Sheet
        open={selectedGroup !== null}
        onOpenChange={() => setSelectedGroup(null)}
      >
        <SheetContent
          side="bottom"
          className="h-[85vh] rounded-t-3xl bg-[#1a1a1a] border-white/10"
        >
          <div className="h-full flex flex-col m-4">
            {/* Group Header */}
            <div
              className="rounded-2xl p-6 -mx-6 -mt-6 mb-6"
              style={{ backgroundColor: selectedGroup?.color }}
            >
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-4xl shadow-lg">
                  {selectedGroup?.logo}
                </div>
                <div className="flex-1">
                  <h2 className="text-white text-2xl mb-1">
                    {selectedGroup?.name}
                  </h2>
                  <div className="flex items-center gap-4 text-white/90 text-sm">
                    <div className="flex items-center gap-1">
                      <Users className="w-4 h-4" />
                      {selectedGroup?.members} members
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="w-4 h-4" />
                      {selectedGroup?.challenges} challenges
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto space-y-6 pb-6">
              {/* About */}
              <div>
                <h3 className="text-white mb-2">About</h3>
                <p className="text-white/60 text-sm leading-relaxed">
                  {selectedGroup?.description}
                </p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                    <MapPin className="w-4 h-4" />
                    Location
                  </div>
                  <div className="text-white">
                    {selectedGroup?.location}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <div className="flex items-center gap-2 text-white/60 text-sm mb-1">
                    <Calendar className="w-4 h-4" />
                    Founded
                  </div>
                  <div className="text-white">
                    {selectedGroup?.founded}
                  </div>
                </div>
              </div>

              {/* Stats */}
              <div>
                <h3 className="text-white mb-3">Group Stats</h3>
                <div className="grid grid-cols-3 gap-3">
                  <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#00c2ff' }}>
                    <div className="text-2xl text-black mb-1">
                      {selectedGroup?.stats.totalRuns}
                    </div>
                    <div className="text-xs text-black/80">
                      Total Runs
                    </div>
                  </div>
                  <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#84cc16' }}>
                    <div className="text-2xl text-black mb-1">
                      {selectedGroup?.stats.totalDistance}
                    </div>
                    <div className="text-xs text-black/80">
                      Distance
                    </div>
                  </div>
                  <div className="rounded-xl p-4 text-center" style={{ backgroundColor: '#a855f7' }}>
                    <div className="text-2xl text-black mb-1">
                      {selectedGroup?.stats.activeMembers}
                    </div>
                    <div className="text-xs text-black/80">
                      Active
                    </div>
                  </div>
                </div>
              </div>

              {/* Recent Members */}
              <div>
                <h3 className="text-white mb-3">Recent Members</h3>
                <div className="space-y-2">
                  {selectedGroup?.recentMembers.map((member: any, index: number) => (
                    <div key={index} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/10">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={member.avatar} />
                        <AvatarFallback>{member.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="text-white">{member.name}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
