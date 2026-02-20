import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Group } from '@/types/database.example';

interface GroupCardProps {
  group: Group;
  onEdit: (group: Group) => void;
  onDelete: (group: Group) => void;
  onPress: (group: Group) => void;
}

export function GroupCard({ group, onEdit, onDelete, onPress }: GroupCardProps) {
  const accentColor = group.color || '#00c2ff';

  return (
    <TouchableOpacity
      onPress={() => onPress(group)}
      className="rounded-2xl bg-white/5 border border-white/10 p-4 flex-row"
      activeOpacity={0.8}
    >
      {/* Logo / Color Badge */}
      <View
        className="w-14 h-14 rounded-xl items-center justify-center mr-3"
        style={{ backgroundColor: `${accentColor}30` }}
      >
        {group.logo ? (
          <Image
            source={{ uri: group.logo }}
            style={{ width: 56, height: 56, borderRadius: 12 }}
            contentFit="cover"
          />
        ) : (
          <Text className="text-2xl font-bold" style={{ color: accentColor }}>
            {group.name.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>

      {/* Content */}
      <View className="flex-1">
        <View className="flex-row items-start justify-between mb-1">
          <Text className="text-white font-bold text-base flex-1 mr-2" numberOfLines={1}>
            {group.name}
          </Text>

          {/* Action Buttons */}
          <View className="flex-row items-center gap-2">
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onEdit(group);
              }}
              hitSlop={8}
            >
              <Ionicons name="pencil" size={16} color="rgba(255,255,255,0.5)" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation();
                onDelete(group);
              }}
              hitSlop={8}
            >
              <Ionicons name="trash-outline" size={16} color="#ef4444" />
            </TouchableOpacity>
          </View>
        </View>

        {group.description ? (
          <Text className="text-white/60 text-xs mb-2" numberOfLines={1}>
            {group.description}
          </Text>
        ) : null}

        {/* Meta Row */}
        <View className="flex-row items-center gap-3">
          <View className="flex-row items-center gap-1">
            <Ionicons name="people-outline" size={12} color="rgba(255,255,255,0.5)" />
            <Text className="text-white/50 text-xs">
              {group.member_count} {group.member_count === 1 ? 'member' : 'members'}
            </Text>
          </View>
          {group.founded ? (
            <View className="flex-row items-center gap-1">
              <Ionicons name="calendar-outline" size={12} color="rgba(255,255,255,0.5)" />
              <Text className="text-white/50 text-xs">{group.founded}</Text>
            </View>
          ) : null}
        </View>
      </View>
    </TouchableOpacity>
  );
}
