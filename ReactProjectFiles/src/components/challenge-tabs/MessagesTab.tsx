import { MessageSquare, AlertCircle, Trophy, Megaphone } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';

const messages = [
  {
    id: 'm1',
    type: 'announcement' as const,
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: 'Great work everyone! We\'re halfway through the challenge. Keep pushing and stay consistent! 💪',
    timestamp: '2 hours ago',
  },
  {
    id: 'm2',
    type: 'milestone' as const,
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: '🎉 Team Milestone: 500 total ability points earned! Amazing progress team!',
    timestamp: '1 day ago',
  },
  {
    id: 'm3',
    type: 'announcement' as const,
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: 'Reminder: Don\'t forget to log your meals today. Nutrition is a key part of this challenge!',
    timestamp: '2 days ago',
  },
  {
    id: 'm4',
    type: 'update' as const,
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: 'New task added for Week 3: Added "10 minutes stretching" to help with recovery.',
    timestamp: '3 days ago',
  },
  {
    id: 'm5',
    type: 'announcement' as const,
    from: { name: 'Challenge Admin', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Admin', role: 'Owner' },
    message: 'Welcome to the 30-Day Fitness Challenge! Let\'s build healthy habits together. Remember to complete your daily tasks and support each other!',
    timestamp: '15 days ago',
  },
];

export default function MessagesTab() {
  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'milestone':
        return <Trophy className="w-5 h-5 text-amber-500" />;
      case 'update':
        return <AlertCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Megaphone className="w-5 h-5" style={{ color: '#00c2ff' }} />;
    }
  };

  const getMessageStyle = (type: string) => {
    switch (type) {
      case 'milestone':
        return 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200';
      case 'update':
        return 'bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200';
      default:
        return '';
    }
  };

  return (
    <div className="p-4 space-y-6">
      {/* Info Alert */}
      <Alert className="bg-blue-50 border-blue-200">
        <AlertCircle className="h-4 w-4 text-blue-600" />
        <AlertDescription className="text-blue-900 text-sm">
          Messages from the challenge owner will appear here. This is a one-way communication channel.
        </AlertDescription>
      </Alert>

      {/* Messages List */}
      <div className="space-y-4">
        <h3 className="text-slate-900">Messages from Admin</h3>

        {messages.map((message) => (
          <div
            key={message.id}
            className={`rounded-xl p-4 border ${getMessageStyle(message.type)}`}
            style={
              message.type === 'announcement' 
                ? { backgroundColor: '#e0f7ff', borderColor: '#a0e0ff' }
                : {}
            }
          >
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                {getMessageIcon(message.type)}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-2">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={message.from.avatar} />
                    <AvatarFallback>{message.from.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-900">{message.from.name}</span>
                    <Badge variant="secondary" className="bg-white/80 text-slate-600 text-xs">
                      {message.from.role}
                    </Badge>
                  </div>
                </div>

                <p className="text-slate-700 mb-2">{message.message}</p>

                <span className="text-xs text-slate-500">{message.timestamp}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Empty State for No Messages */}
      {messages.length === 0 && (
        <div className="text-center py-12">
          <MessageSquare className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h4 className="text-slate-900 mb-2">No messages yet</h4>
          <p className="text-slate-600 text-sm">
            The challenge owner hasn't posted any messages yet. Check back later!
          </p>
        </div>
      )}
    </div>
  );
}
