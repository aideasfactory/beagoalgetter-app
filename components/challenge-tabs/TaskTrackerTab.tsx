import { useState, useEffect, useMemo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Svg, { Circle, Path } from 'react-native-svg';
import { useTodaysTasks, type TodayTask } from '@/hooks/useTodaysTasks';
import { useCompleteDay } from '@/hooks/useCompleteDay';
import type { MoodType } from '@/types/database.example';

interface TaskTrackerTabProps {
  challengeId: string;
  challengeTitle: string;
  currentStreak: number;
  onDayCompleted?: () => void;
}

interface MoodOption {
  id: MoodType;
  label: string;
  color: string;
}

const MOOD_OPTIONS: MoodOption[] = [
  { id: 'very-sad', label: 'Very Sad', color: '#ef4444' },
  { id: 'sad', label: 'Sad', color: '#f97316' },
  { id: 'neutral', label: 'Okay', color: '#eab308' },
  { id: 'happy', label: 'Happy', color: '#84cc16' },
  { id: 'very-happy', label: 'Great', color: '#22c55e' },
];

function MoodFace({ mood, color, isSelected }: { mood: MoodType; color: string; isSelected: boolean }) {
  const size = 48;
  const opacity = isSelected ? 1 : 0.4;

  // Face circle background
  const faceColor = isSelected ? color : 'rgba(255,255,255,0.5)';

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      {/* Face circle */}
      <Circle cx="50" cy="50" r="45" fill={faceColor} opacity={opacity} />

      {/* Eyes */}
      <Circle cx="35" cy="40" r="5" fill={isSelected ? '#000' : '#fff'} opacity={opacity} />
      <Circle cx="65" cy="40" r="5" fill={isSelected ? '#000' : '#fff'} opacity={opacity} />

      {/* Mouth - varies by mood */}
      {mood === 'very-sad' && (
        <>
          {/* Deep frown */}
          <Path
            d="M 30 75 Q 50 65 70 75"
            stroke={isSelected ? '#000' : '#fff'}
            strokeWidth="3"
            fill="none"
            opacity={opacity}
          />
          {/* Sad eyebrows */}
          <Path d="M 25 30 L 40 33" stroke={isSelected ? '#000' : '#fff'} strokeWidth="3" opacity={opacity} />
          <Path d="M 75 30 L 60 33" stroke={isSelected ? '#000' : '#fff'} strokeWidth="3" opacity={opacity} />
        </>
      )}

      {mood === 'sad' && (
        <>
          {/* Slight frown */}
          <Path
            d="M 30 70 Q 50 63 70 70"
            stroke={isSelected ? '#000' : '#fff'}
            strokeWidth="3"
            fill="none"
            opacity={opacity}
          />
          {/* Slightly sad eyebrows */}
          <Path d="M 28 32 L 38 34" stroke={isSelected ? '#000' : '#fff'} strokeWidth="2.5" opacity={opacity} />
          <Path d="M 72 32 L 62 34" stroke={isSelected ? '#000' : '#fff'} strokeWidth="2.5" opacity={opacity} />
        </>
      )}

      {mood === 'neutral' && (
        <>
          {/* Straight line mouth */}
          <Path
            d="M 30 65 L 70 65"
            stroke={isSelected ? '#000' : '#fff'}
            strokeWidth="3"
            opacity={opacity}
          />
        </>
      )}

      {mood === 'happy' && (
        <>
          {/* Smile */}
          <Path
            d="M 30 60 Q 50 70 70 60"
            stroke={isSelected ? '#000' : '#fff'}
            strokeWidth="3"
            fill="none"
            opacity={opacity}
          />
        </>
      )}

      {mood === 'very-happy' && (
        <>
          {/* Big smile */}
          <Path
            d="M 25 55 Q 50 75 75 55"
            stroke={isSelected ? '#000' : '#fff'}
            strokeWidth="3"
            fill="none"
            opacity={opacity}
          />
          {/* Happy eyes - crescents */}
          <Path d="M 28 38 Q 35 43 42 38" stroke={isSelected ? '#000' : '#fff'} strokeWidth="3" fill="none" opacity={opacity} />
          <Path d="M 58 38 Q 65 43 72 38" stroke={isSelected ? '#000' : '#fff'} strokeWidth="3" fill="none" opacity={opacity} />
        </>
      )}
    </Svg>
  );
}

export function TaskTrackerTab({ challengeId, challengeTitle, currentStreak, onDayCompleted }: TaskTrackerTabProps) {
  const { tasks: dbTasks, loading: tasksLoading, hasTasks, refetch: refetchTasks } = useTodaysTasks(challengeId);
  const { completeDay, loading: submitting } = useCompleteDay();

  // Local state for task toggles (initialized from DB)
  const [localTasks, setLocalTasks] = useState<TodayTask[]>([]);
  // Track which checklist items are checked per task: { taskId: Set<itemId> }
  const [checkedItems, setCheckedItems] = useState<Record<string, Set<string>>>({});
  const [note, setNote] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  // Sync local tasks and initialize checkedItems when DB tasks change
  useEffect(() => {
    setLocalTasks(dbTasks);
    // Initialize: if task is already completed from DB, mark all its items as checked
    const initial: Record<string, Set<string>> = {};
    for (const task of dbTasks) {
      if (task.completed && task.items.length > 0) {
        initial[task.id] = new Set(task.items.map(i => i.id));
      } else {
        initial[task.id] = new Set();
      }
    }
    setCheckedItems(initial);
  }, [dbTasks]);

  // Computed values
  const completedCount = localTasks.filter(t => t.completed).length;
  const requiredTasks = localTasks.filter(t => t.required);
  const completedRequired = requiredTasks.filter(t => t.completed).length;
  const allRequiredCompleted = requiredTasks.length === 0
    ? completedCount > 0 // No required tasks: allow submit if at least one task is checked
    : completedRequired === requiredTasks.length;
  const dayAlreadyCompleted = dbTasks.length > 0 && dbTasks.every(t => t.completed);

  // Aggregate attachments from all today's tasks
  const allAttachments = useMemo(() => {
    const docs: { url: string; name: string }[] = [];
    const videos: { url: string; name: string }[] = [];
    for (const task of dbTasks) {
      for (const att of task.attachments) {
        if (att.type === 'youtube') {
          videos.push({ url: att.url, name: att.name || 'Watch video' });
        } else if (att.type === 'document') {
          docs.push({ url: att.url, name: att.name || 'Download document' });
        }
      }
    }
    return { docs, videos };
  }, [dbTasks]);

  const hasResources = allAttachments.docs.length > 0 || allAttachments.videos.length > 0;

  // Toggle a single checklist item within a task
  const toggleItem = (taskId: string, itemId: string, totalItems: number) => {
    if (dayAlreadyCompleted) return;
    setCheckedItems(prev => {
      const taskSet = new Set(prev[taskId] || []);
      if (taskSet.has(itemId)) {
        taskSet.delete(itemId);
      } else {
        taskSet.add(itemId);
      }
      const allChecked = taskSet.size === totalItems;
      // Auto-complete/uncomplete the task based on whether all items are checked
      setLocalTasks(prevTasks =>
        prevTasks.map(t => t.id === taskId ? { ...t, completed: allChecked } : t)
      );
      return { ...prev, [taskId]: taskSet };
    });
  };

  // Toggle for tasks with no checklist items (simple on/off)
  const toggleTask = (taskId: string) => {
    if (dayAlreadyCompleted) return;
    setLocalTasks(prev =>
      prev.map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      )
    );
  };

  const handleImageUpload = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (permissionResult.granted === false) {
      Alert.alert('Permission Required', 'Permission to access camera roll is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setUploadedImage(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!allRequiredCompleted || dayAlreadyCompleted) return;

    const checkedTaskIds = localTasks.filter(t => t.completed).map(t => t.id);

    const result = await completeDay({
      challengeId,
      challengeTitle,
      taskIds: checkedTaskIds,
      mood: selectedMood,
      notes: note,
      imageUri: uploadedImage,
    });

    if (result.success) {
      Alert.alert(
        'Great work!',
        `Day completed! Your streak is now ${result.newStreak || currentStreak + 1}!`,
        [{
          text: 'OK',
          onPress: () => {
            // Reset form state
            setNote('');
            setUploadedImage(null);
            setSelectedMood(null);
            // Refetch to update completed state
            refetchTasks();
            onDayCompleted?.();
          },
        }],
      );
    } else {
      Alert.alert('Error', result.error || 'Something went wrong. Please try again.');
    }
  };

  const handleOpenUrl = (url: string) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Could not open the link.');
    });
  };

  // Loading state
  if (tasksLoading) {
    return (
      <View className="flex-1 bg-black items-center justify-center py-20">
        <ActivityIndicator size="large" color="#00c2ff" />
      </View>
    );
  }

  // No tasks today state
  if (!hasTasks) {
    return (
      <View className="flex-1 bg-black items-center justify-center py-20 px-6">
        <View className="w-16 h-16 rounded-full bg-white/5 items-center justify-center mb-4">
          <Ionicons name="checkmark-done" size={32} color="rgba(255,255,255,0.3)" />
        </View>
        <Text className="text-white text-lg font-bold mb-2">No tasks today</Text>
        <Text className="text-white/60 text-sm text-center">
          There are no tasks scheduled for today. Enjoy your rest day!
        </Text>
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-black">
      <View className="p-6 space-y-6 pb-32">
        {/* Streak Info */}
        <View className="p-6 rounded-2xl" style={{ backgroundColor: '#f97316' }}>
          <View className="flex-row items-center justify-between">
            <View>
              <View className="flex-row items-center gap-2 mb-1">
                <Ionicons name="flame" size={24} color="white" />
                <Text className="text-white">Current Streak</Text>
              </View>
              <Text className="text-white text-4xl font-bold">{currentStreak} days</Text>
              <Text className="text-white/80 text-sm mt-1">Keep going! You're doing amazing!</Text>
            </View>
            <View className="items-end">
              <Text className="text-white/80 mb-1">Today&apos;s Progress</Text>
              <Text className="text-white text-3xl font-bold">{completedCount}/{localTasks.length}</Text>
              <Text className="text-white/80 text-xs mt-1">tasks completed</Text>
            </View>
          </View>
        </View>

        {/* Task Cards - one per task */}
        {localTasks.map((task) => (
          <View key={task.id} className='my-3 bg-white/5 border border-white/10 rounded-2xl p-4'>
            <Text className="text-white text-lg font-bold">{task.title}</Text>
            {task.description && (
              <Text className="text-white/60 text-base mb-4">{task.description}</Text>
            )}

            {/* Task checklist items — individually checkable */}
            {task.items.length > 0 ? (
              <View className='mt-2'>
                {task.items.map((item) => {
                  const isChecked = checkedItems[task.id]?.has(item.id) ?? false;
                  return (
                    <TouchableOpacity
                      key={item.id}
                      onPress={() => toggleItem(task.id, item.id, task.items.length)}
                      disabled={dayAlreadyCompleted}
                      className="p-3 rounded-xl border mb-2"
                      style={{
                        backgroundColor: isChecked ? 'rgba(0, 194, 255, 0.08)' : '#1a1a1a',
                        borderColor: isChecked ? 'rgba(0, 194, 255, 0.3)' : 'rgba(255,255,255,0.1)',
                      }}
                    >
                      <View className="flex-row items-center gap-3">
                        <View
                          className="w-5 h-5 rounded border-2 items-center justify-center"
                          style={
                            isChecked
                              ? { backgroundColor: '#00c2ff', borderColor: '#00c2ff' }
                              : { borderColor: '#cbd5e1' }
                          }
                        >
                          {isChecked && <Ionicons name="checkmark" size={14} color="white" />}
                        </View>
                        <Text
                          className={isChecked ? 'text-white/50 line-through flex-1' : 'text-white/80 flex-1'}
                        >
                          {item.title}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
                {/* Completed indicator when all items checked */}
                {task.completed && (
                  <View className="flex-row items-center gap-2 mt-1 px-1">
                    <Ionicons name="checkmark-circle" size={16} color="#00c2ff" />
                    <Text className="text-sm" style={{ color: '#00c2ff' }}>All items completed</Text>
                  </View>
                )}
              </View>
            ) : (
              /* Tasks with no checklist items — simple toggle */
              <TouchableOpacity
                onPress={() => toggleTask(task.id)}
                disabled={dayAlreadyCompleted}
                className="p-4 rounded-xl border-2 mt-2"
                style={
                  task.completed
                    ? { backgroundColor: '#e0f7ff', borderColor: '#a0e0ff' }
                    : { backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }
                }
              >
                <View className="flex-row items-center gap-3">
                  <View
                    className="w-6 h-6 rounded-full border-2 items-center justify-center"
                    style={
                      task.completed
                        ? { backgroundColor: '#00c2ff', borderColor: '#00c2ff' }
                        : { borderColor: '#cbd5e1' }
                    }
                  >
                    {task.completed && <Ionicons name="checkmark" size={16} color="white" />}
                  </View>
                  <Text
                    className={task.completed ? 'text-slate-500 line-through' : 'text-white'}
                    style={{ flex: 1 }}
                  >
                    {task.completed ? 'Completed' : 'Mark as complete'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        ))}

        {/* Task Resources */}
        {hasResources && (
          <View className='my-3 bg-white/5 border border-white/10 rounded-2xl p-4'>
            <Text className="text-white text-lg font-bold mb-3">Resources</Text>
            <View className="space-y-3">
              {allAttachments.docs.map((doc, index) => (
                <TouchableOpacity
                  key={`doc-${index}`}
                  onPress={() => handleOpenUrl(doc.url)}
                  className="mb-3 flex-row items-center justify-between p-4 rounded-xl bg-[#1a1a1a] border border-white/15"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                      <Ionicons name="document-text-outline" size={22} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold">{doc.name}</Text>
                    </View>
                  </View>
                  <Ionicons name="download-outline" size={20} color="white" />
                </TouchableOpacity>
              ))}

              {allAttachments.videos.map((video, index) => (
                <TouchableOpacity
                  key={`video-${index}`}
                  onPress={() => handleOpenUrl(video.url)}
                  className="flex-row items-center justify-between p-4 rounded-xl bg-[#1a1a1a] border border-white/15"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-red-600/80 items-center justify-center">
                      <Ionicons name="logo-youtube" size={22} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold">{video.name}</Text>
                    </View>
                  </View>
                  <Ionicons name="play-circle-outline" size={22} color="white" />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Photo Evidence */}
        {!dayAlreadyCompleted && (
          <View className='mb-6'>
            <Text className="text-white text-lg font-bold mb-3">Add Photo Evidence (Optional)</Text>

            {uploadedImage ? (
              <View className="relative rounded-xl overflow-hidden">
                <Image
                  source={{ uri: uploadedImage }}
                  style={{ width: '100%', height: 256 }}
                  contentFit="cover"
                />
                <TouchableOpacity
                  onPress={() => setUploadedImage(null)}
                  className="absolute top-3 right-3 w-8 h-8 bg-red-500 rounded-full items-center justify-center"
                  style={{ backgroundColor: '#ef4444' }}
                >
                  <Ionicons name="close" size={16} color="white" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={handleImageUpload}>
                <View className="border-2 border-dashed border-white/20 rounded-xl p-8 items-center bg-[#1a1a1a]">
                  <Ionicons name="camera-outline" size={48} color="rgba(255,255,255,0.4)" />
                  <Text className="text-white/60 mt-3 mb-1">Upload a photo</Text>
                  <Text className="text-white/40 text-sm">Show your progress!</Text>
                </View>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Notes */}
        {!dayAlreadyCompleted && (
          <View className='mb-6'>
            <Text className="text-white text-lg font-bold mb-3">Add Notes (Optional)</Text>
            <View className="relative">
              <View className="absolute left-3 top-3 z-10">
                <Ionicons name="document-text-outline" size={20} color="rgba(255,255,255,0.4)" />
              </View>
              <TextInput
                value={note}
                onChangeText={setNote}
                placeholder="How did today go? Any reflections or wins to share?"
                placeholderTextColor="rgba(255,255,255,0.4)"
                multiline
                numberOfLines={4}
                className="pl-10 p-3 bg-[#1a1a1a] border border-white/20 rounded-xl text-white min-h-[120px]"
                style={{ textAlignVertical: 'top' }}
              />
            </View>

            {/* Mood Selector */}
            <View className="mt-4">
              <Text className="text-white/80 text-sm mb-3">How are you feeling?</Text>
              <View className="flex-row justify-between items-center px-2">
                {MOOD_OPTIONS.map((mood) => (
                  <TouchableOpacity
                    key={mood.id}
                    onPress={() => setSelectedMood(mood.id)}
                    className="items-center"
                    style={{ width: 60 }}
                  >
                    <View
                      className="rounded-full p-2 mb-2"
                      style={{
                        backgroundColor: selectedMood === mood.id ? 'rgba(255,255,255,0.1)' : 'transparent',
                        transform: selectedMood === mood.id ? [{ scale: 1.1 }] : [{ scale: 1 }],
                      }}
                    >
                      <MoodFace
                        mood={mood.id}
                        color={mood.color}
                        isSelected={selectedMood === mood.id}
                      />
                    </View>
                    <Text
                      className="text-xs text-center"
                      style={{
                        color: selectedMood === mood.id ? mood.color : 'rgba(255,255,255,0.4)',
                        fontWeight: selectedMood === mood.id ? 'bold' : 'normal',
                      }}
                    >
                      {mood.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Day Already Completed Banner */}
        {dayAlreadyCompleted && (
          <View className="p-6 rounded-2xl items-center" style={{ backgroundColor: 'rgba(0, 194, 255, 0.1)', borderWidth: 1, borderColor: 'rgba(0, 194, 255, 0.3)' }}>
            <Ionicons name="checkmark-circle" size={48} color="#00c2ff" />
            <Text className="text-white font-bold text-lg mt-3">Day Complete!</Text>
            <Text className="text-white/60 text-sm mt-1 text-center">
              You&apos;ve already completed today&apos;s tasks. Great work!
            </Text>
          </View>
        )}
      </View>

      {/* Submit Button - Fixed at bottom */}
      {!dayAlreadyCompleted && (
        <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
          <TouchableOpacity
            onPress={handleSubmit}
            disabled={!allRequiredCompleted || submitting}
            className="w-full py-4 rounded-xl items-center flex-row justify-center"
            style={{
              backgroundColor: allRequiredCompleted ? '#00c2ff' : '#cbd5e1',
              opacity: submitting ? 0.7 : 1,
            }}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="black" />
            ) : allRequiredCompleted ? (
              <>
                <Ionicons name="checkmark-circle" size={20} color="black" />
                <Text
                  className="ml-2 font-bold text-lg"
                  style={{ color: 'black' }}
                >
                  Complete Day {currentStreak + 1}
                </Text>
              </>
            ) : (
              <Text style={{ color: '#64748b' }} className="font-bold text-lg">
                {requiredTasks.length === 0
                  ? 'Complete at least one task'
                  : `Complete ${requiredTasks.length - completedRequired} more required task${requiredTasks.length - completedRequired !== 1 ? 's' : ''}`}
              </Text>
            )}
          </TouchableOpacity>
          {!allRequiredCompleted && (
            <Text className="text-white/40 text-xs text-center mt-2">
              {requiredTasks.length === 0
                ? 'Complete at least one task to mark today as done'
                : 'Finish all required tasks to mark today as complete'}
            </Text>
          )}
        </View>
      )}
    </ScrollView>
  );
}
