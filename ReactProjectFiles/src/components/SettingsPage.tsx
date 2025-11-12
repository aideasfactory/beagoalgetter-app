import { ArrowLeft, Bell, Globe, Lock, HelpCircle, FileText, LogOut, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Switch } from './ui/switch';
import { Card } from './ui/card';
import { Separator } from './ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';

interface SettingsPageProps {
  onBack: () => void;
  onLogout: () => void;
}

export default function SettingsPage({ onBack, onLogout }: SettingsPageProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Top Navigation */}
      <div className="sticky top-0 bg-white/80 backdrop-blur-lg border-b border-slate-200 z-40">
        <div className="px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-slate-600" />
            </button>
            <h2 className="text-slate-900">Settings</h2>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        {/* Notifications */}
        <div>
          <h3 className="text-slate-900 mb-4">Notifications</h3>
          <Card className="p-4 bg-white divide-y divide-slate-100">
            <div className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="text-slate-900">Push Notifications</div>
                    <div className="text-sm text-slate-500">Receive daily reminders</div>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="text-slate-900">Achievement Alerts</div>
                    <div className="text-sm text-slate-500">Celebrate your wins</div>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>

            <div className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-slate-600" />
                  <div>
                    <div className="text-slate-900">Team Updates</div>
                    <div className="text-sm text-slate-500">Group announcements</div>
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>

        {/* Notification Timing */}
        <div>
          <h3 className="text-slate-900 mb-4">Notification Preferences</h3>
          <Card className="p-4 bg-white space-y-4">
            <div>
              <label className="text-slate-700 mb-2 block">Reminder Time</label>
              <Select defaultValue="morning">
                <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Morning (8:00 AM)</SelectItem>
                  <SelectItem value="afternoon">Afternoon (2:00 PM)</SelectItem>
                  <SelectItem value="evening">Evening (6:00 PM)</SelectItem>
                  <SelectItem value="random">Random (Surprise me!)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-slate-700 mb-2 block">Frequency</label>
              <Select defaultValue="daily">
                <SelectTrigger className="bg-white border-slate-200 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="twice">Twice per day</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>

        {/* Auto-Post Settings */}
        <div>
          <h3 className="text-slate-900 mb-4">Auto-Post to Social Media</h3>
          <Card className="p-4 bg-white divide-y divide-slate-100">
            <div className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Auto-post success to Instagram</div>
                  <div className="text-sm text-slate-500">Share your wins automatically</div>
                </div>
                <Switch />
              </div>
            </div>

            <div className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Auto-post success to Twitter</div>
                  <div className="text-sm text-slate-500">Tweet your achievements</div>
                </div>
                <Switch />
              </div>
            </div>

            <div className="py-3 first:pt-0 last:pb-0">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-slate-900">Include photos in posts</div>
                  <div className="text-sm text-slate-500">Share proof images</div>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </Card>
        </div>

        {/* Account Settings */}
        <div>
          <h3 className="text-slate-900 mb-4">Account</h3>
          <Card className="p-4 bg-white divide-y divide-slate-100">
            <button className="py-3 first:pt-0 last:pb-0 w-full flex items-center justify-between hover:bg-slate-50 -mx-4 px-4 transition-colors">
              <div className="flex items-center gap-3">
                <Lock className="w-5 h-5 text-slate-600" />
                <div className="text-slate-900 text-left">Change Password</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button className="py-3 first:pt-0 last:pb-0 w-full flex items-center justify-between hover:bg-slate-50 -mx-4 px-4 transition-colors">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-slate-600" />
                <div className="text-slate-900 text-left">Language</div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">English</span>
                <ChevronRight className="w-5 h-5 text-slate-400" />
              </div>
            </button>
          </Card>
        </div>

        {/* Support */}
        <div>
          <h3 className="text-slate-900 mb-4">Support & Legal</h3>
          <Card className="p-4 bg-white divide-y divide-slate-100">
            <button className="py-3 first:pt-0 last:pb-0 w-full flex items-center justify-between hover:bg-slate-50 -mx-4 px-4 transition-colors">
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-slate-600" />
                <div className="text-slate-900 text-left">Help Center</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button className="py-3 first:pt-0 last:pb-0 w-full flex items-center justify-between hover:bg-slate-50 -mx-4 px-4 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <div className="text-slate-900 text-left">Privacy Policy</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>

            <button className="py-3 first:pt-0 last:pb-0 w-full flex items-center justify-between hover:bg-slate-50 -mx-4 px-4 transition-colors">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-slate-600" />
                <div className="text-slate-900 text-left">Terms of Service</div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-400" />
            </button>
          </Card>
        </div>

        {/* App Version */}
        <div className="text-center text-sm text-slate-500">
          Version 1.0.0
        </div>

        {/* Logout Button */}
        <Button
          onClick={onLogout}
          variant="outline"
          className="w-full border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 py-6 rounded-xl"
        >
          <LogOut className="w-5 h-5 mr-2" />
          Log Out
        </Button>
      </div>
    </div>
  );
}
