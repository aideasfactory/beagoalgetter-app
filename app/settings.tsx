import React, { useState } from 'react';
import { View, ScrollView, Text, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useSession } from '@/context';
import { useNotificationPreferences } from '@/hooks/useNotificationPreferences';

export default function SettingsScreen() {
  const { signOut } = useSession();
  const { preferences, loading: prefsLoading, updatePreference } = useNotificationPreferences();

  // Auto-post states
  const [autoPostInstagram, setAutoPostInstagram] = useState(false);
  const [autoPostTwitter, setAutoPostTwitter] = useState(false);
  const [includePhotos, setIncludePhotos] = useState(true);

  const handleLogout = () => {
    Alert.alert(
      'Log Out',
      'Are you sure you want to log out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Log Out',
          style: 'destructive',
          onPress: async () => {
            await signOut();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="p-6 border-b border-white/10">
        <View className="flex-row items-center gap-3">
          <TouchableOpacity
            onPress={() => router.back()}
            className="w-10 h-10 items-center justify-center"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-white text-xl font-bold">Settings</Text>
        </View>
      </View>

      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <View className="px-4 py-6 space-y-6">
          
          {/* Notifications Section */}
          <View className="my-4">
            <Text className="text-white/60 text-sm mb-3 uppercase tracking-wider">
              Notifications
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {/* Push Notifications */}
              <View className="px-4 py-4 border-b border-white/10">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Ionicons name="notifications" size={20} color="rgba(255,255,255,0.6)" />
                    <View className="flex-1">
                      <Text className="text-white font-medium">Push Notifications</Text>
                      <Text className="text-white/50 text-sm">Receive daily reminders</Text>
                    </View>
                  </View>
                  {prefsLoading ? (
                    <ActivityIndicator size="small" color="#00c2ff" />
                  ) : (
                    <Switch
                      value={preferences.push_enabled}
                      onValueChange={(val) => updatePreference('push_enabled', val)}
                      trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#00c2ff' }}
                      thumbColor="white"
                    />
                  )}
                </View>
              </View>

              {/* Achievement Alerts */}
              <View className="px-4 py-4 border-b border-white/10">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Ionicons name="trophy" size={20} color="rgba(255,255,255,0.6)" />
                    <View className="flex-1">
                      <Text className="text-white font-medium">Achievement Alerts</Text>
                      <Text className="text-white/50 text-sm">Celebrate your wins</Text>
                    </View>
                  </View>
                  {prefsLoading ? (
                    <ActivityIndicator size="small" color="#00c2ff" />
                  ) : (
                    <Switch
                      value={preferences.achievement_alerts}
                      onValueChange={(val) => updatePreference('achievement_alerts', val)}
                      trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#00c2ff' }}
                      thumbColor="white"
                    />
                  )}
                </View>
              </View>

              {/* Team Updates */}
              <View className="px-4 py-4">
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3 flex-1">
                    <Ionicons name="people" size={20} color="rgba(255,255,255,0.6)" />
                    <View className="flex-1">
                      <Text className="text-white font-medium">Team Updates</Text>
                      <Text className="text-white/50 text-sm">Group announcements</Text>
                    </View>
                  </View>
                  {prefsLoading ? (
                    <ActivityIndicator size="small" color="#00c2ff" />
                  ) : (
                    <Switch
                      value={preferences.team_updates}
                      onValueChange={(val) => updatePreference('team_updates', val)}
                      trackColor={{ false: 'rgba(255,255,255,0.2)', true: '#00c2ff' }}
                      thumbColor="white"
                    />
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Support & Legal */}
          <View className="my-4">
            <Text className="text-white/60 text-sm mb-3 uppercase tracking-wider">
              Support & Legal
            </Text>
            <View className="bg-white/5 border border-white/10 rounded-xl overflow-hidden">
              {/* Help Center */}
              <TouchableOpacity 
                className="px-4 py-4 border-b border-white/10 flex-row items-center justify-between active:bg-white/5"
                onPress={() => {
                  Alert.alert('Coming Soon', 'Help Center will be available soon');
                }}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="help-circle" size={20} color="rgba(255,255,255,0.6)" />
                  <Text className="text-white font-medium">Help Center</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>

              {/* Privacy Policy */}
              <TouchableOpacity 
                className="px-4 py-4 border-b border-white/10 flex-row items-center justify-between active:bg-white/5"
                onPress={() => {
                  Alert.alert('Privacy Policy', 'Privacy Policy page will be implemented soon');
                }}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="document-text" size={20} color="rgba(255,255,255,0.6)" />
                  <Text className="text-white font-medium">Privacy Policy</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>

              {/* Terms of Service */}
              <TouchableOpacity 
                className="px-4 py-4 flex-row items-center justify-between active:bg-white/5"
                onPress={() => {
                  Alert.alert('Terms of Service', 'Terms of Service page will be implemented soon');
                }}
              >
                <View className="flex-row items-center gap-3">
                  <Ionicons name="document-text" size={20} color="rgba(255,255,255,0.6)" />
                  <Text className="text-white font-medium">Terms of Service</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.4)" />
              </TouchableOpacity>
            </View>
          </View>

          {/* App Version */}
          <View className="items-center py-4">
            <Text className="text-white/40 text-sm">Version 1.0.0</Text>
          </View>

          {/* Logout Button */}
          <TouchableOpacity
            onPress={handleLogout}
            className="bg-red-500/20 border border-red-500/40 rounded-xl px-4 py-4 flex-row items-center justify-center active:bg-red-500/30 mb-8"
          >
            <Ionicons name="log-out-outline" size={20} color="#ef4444" />
            <Text className="text-red-500 font-bold text-lg ml-2">Log Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
