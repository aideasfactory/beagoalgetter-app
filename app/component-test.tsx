import { useState } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge, ProgressBar, ProgressRing, SearchBar } from '@/components';

export default function ComponentTestScreen() {
  const [searchValue, setSearchValue] = useState('');

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="flex-row items-center px-4 py-4 border-b border-white/10">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
          <Ionicons name="arrow-back" size={24} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-bold">Component Test</Text>
      </View>

      <ScrollView className="flex-1 px-6 py-6">
        {/* Badge Component */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">Badge Component</Text>
          <View className="flex-row flex-wrap gap-2">
            <Badge text="Personal" color="#00c2ff" size="sm" />
            <Badge text="Team" color="#00c2ff" size="md" />
            <Badge text="Group" color="#00c2ff" size="lg" />
            <Badge text="Success" color="#10b981" size="md" />
            <Badge text="Failed" color="#ef4444" size="md" />
            <Badge text="Active" color="#f59e0b" size="md" />
          </View>
        </View>

        {/* ProgressBar Component */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">ProgressBar Component</Text>
          <View className="space-y-4">
            <View>
              <Text className="text-white/60 text-sm mb-2">25% Progress</Text>
              <ProgressBar progress={25} />
            </View>
            <View>
              <Text className="text-white/60 text-sm mb-2">50% Progress (Green)</Text>
              <ProgressBar progress={50} color="#10b981" />
            </View>
            <View>
              <Text className="text-white/60 text-sm mb-2">75% Progress (Thick)</Text>
              <ProgressBar progress={75} height={12} />
            </View>
            <View>
              <Text className="text-white/60 text-sm mb-2">100% Progress</Text>
              <ProgressBar progress={100} />
            </View>
          </View>
        </View>

        {/* ProgressRing Component */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">ProgressRing Component</Text>
          <View className="flex-row flex-wrap gap-4">
            <View className="items-center">
              <ProgressRing progress={25} size={80} showPercentage />
            </View>
            <View className="items-center">
              <ProgressRing progress={50} size={80} color="#10b981" showPercentage />
            </View>
            <View className="items-center">
              <ProgressRing progress={75} size={80} strokeWidth={12} showPercentage />
            </View>
            <View className="items-center">
              <ProgressRing progress={100} size={80} color="#f59e0b" showPercentage />
            </View>
          </View>
        </View>

        {/* SearchBar Component */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">SearchBar Component</Text>
          <SearchBar
            value={searchValue}
            onChangeText={setSearchValue}
            placeholder="Search challenges..."
          />
          {searchValue.length > 0 && (
            <Text className="text-white/60 text-sm mt-2">
              Searching for: "{searchValue}"
            </Text>
          )}
        </View>

        {/* Combined Example */}
        <View className="mb-8">
          <Text className="text-white text-lg font-bold mb-4">Combined Example</Text>
          <View className="bg-[#1a1a1a] border border-white/10 rounded-2xl p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-white font-bold">Morning Run Challenge</Text>
              <Badge text="Team" color="#00c2ff" size="sm" />
            </View>
            <Text className="text-white/60 text-sm mb-3">
              Complete 3 miles every morning for 30 days
            </Text>
            <View className="mb-2">
              <View className="flex-row justify-between mb-1">
                <Text className="text-white/60 text-xs">Progress</Text>
                <Text className="text-white/60 text-xs">18/30 days</Text>
              </View>
              <ProgressBar progress={60} />
            </View>
            <View className="flex-row items-center mt-2">
              <ProgressRing progress={60} size={40} strokeWidth={4} />
              <View className="ml-3">
                <Text className="text-white text-sm font-bold">60% Complete</Text>
                <Text className="text-white/60 text-xs">12 days remaining</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
