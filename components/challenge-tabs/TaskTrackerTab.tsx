import { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { Image } from 'expo-image';
import Svg, { Circle, Path } from 'react-native-svg';

interface TaskTrackerTabProps {
  challengeId: string;
}

interface Task {
  id: string;
  title: string;
  completed: boolean;
  required: boolean;
}

type MoodType = 'very-sad' | 'sad' | 'neutral' | 'happy' | 'very-happy';

interface MoodOption {
  id: MoodType;
  label: string;
  color: string;
}

const mockTodaysTasks: Task[] = [
  { id: 't1', title: '20 minutes cardio', completed: true, required: true },
  { id: 't2', title: '3 sets of strength training', completed: true, required: true },
  { id: 't3', title: 'Log meals', completed: false, required: true },
  { id: 't4', title: 'Drink 8 glasses of water', completed: false, required: false },
];

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

export function TaskTrackerTab({ challengeId }: TaskTrackerTabProps) {
  const [tasks, setTasks] = useState<Task[]>(mockTodaysTasks);
  const [note, setNote] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(15);
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);

  const completedCount = tasks.filter(t => t.completed).length;
  const requiredTasks = tasks.filter(t => t.required);
  const completedRequired = requiredTasks.filter(t => t.completed).length;
  const allRequiredCompleted = completedRequired === requiredTasks.length;

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
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

  const handleSubmit = () => {
    if (allRequiredCompleted) {
      Alert.alert(
        '🎉 Great work!',
        `Day ${currentStreak + 1} completed! Your streak continues!`,
        [{ text: 'OK', onPress: () => setCurrentStreak(currentStreak + 1) }]
      );
    } else {
      Alert.alert(
        'Complete Required Tasks',
        'You need to finish all required tasks to mark the day as complete.'
      );
    }
  };

  const handleDownloadDocument = () => {
    Alert.alert('Download Guide', 'This is a mock download for today’s task guide.');
  };

  const handleWatchYoutube = () => {
    Alert.alert('Watch Video', 'This is a mock link to today’s YouTube video.');
  };

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
              <Text className="text-white/80 text-sm mt-1">Keep going! You’re doing amazing!</Text>
            </View>
            <View className="items-end">
              <Text className="text-white/80 mb-1">Today&apos;s Progress</Text>
              <Text className="text-white text-3xl font-bold">{completedCount}/{tasks.length}</Text>
              <Text className="text-white/80 text-xs mt-1">tasks completed</Text>
            </View>
          </View>
        </View>

        <View className='my-6 bg-white/5 border border-white/10 rounded-2xl p-4'>
          <Text className="text-white text-lg font-bold">This is the task title</Text>
          <Text className="text-white text-base mb-4">This is the task description</Text>

            {/* Today's Tasks */}
            <View className='mb-6'>
              <View className="space-y-3">
                {tasks.map((task) => (
                  <TouchableOpacity
                    key={task.id}
                    onPress={() => toggleTask(task.id)}
                    className="p-4 rounded-xl border-2 mb-3"
                    style={
                      task.completed 
                        ? { backgroundColor: '#e0f7ff', borderColor: '#a0e0ff' }
                        : { backgroundColor: '#1a1a1a', borderColor: 'rgba(255,255,255,0.1)' }
                    }
                  >
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center gap-3 flex-1">
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
                          {task.title}
                        </Text>
                      </View>
                      {/* {task.required && !task.completed && (
                        <View className="bg-amber-100 px-2 py-1 rounded-full">
                          <Text className="text-amber-700 text-xs font-bold">Required</Text>
                        </View>
                      )} */}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Task Resources */}
            <View className="">
              <Text className="text-white text-lg font-bold mb-3">Resources</Text>
              <View className="space-y-3">
                <TouchableOpacity
                  onPress={handleDownloadDocument}
                  className="mb-3 flex-row items-center justify-between p-4 rounded-xl bg-[#1a1a1a] border border-white/15"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-white/10 items-center justify-center">
                      <Ionicons name="document-text-outline" size={22} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold">Download today’s guide</Text>
                      <Text className="text-white/60 text-xs">Mock document attached to today’s tasks</Text>
                    </View>
                  </View>
                  <Ionicons name="download-outline" size={20} color="white" />
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={handleWatchYoutube}
                  className="flex-row items-center justify-between p-4 rounded-xl bg-[#1a1a1a] border border-white/15"
                >
                  <View className="flex-row items-center gap-3 flex-1">
                    <View className="w-10 h-10 rounded-full bg-red-600/80 items-center justify-center">
                      <Ionicons name="logo-youtube" size={22} color="white" />
                    </View>
                    <View className="flex-1">
                      <Text className="text-white font-semibold">Watch today’s video</Text>
                      <Text className="text-white/60 text-xs">Mock YouTube link for task instructions</Text>
                    </View>
                  </View>
                  <Ionicons name="play-circle-outline" size={22} color="white" />
                </TouchableOpacity>
              </View>
            </View>

        </View>

      
        {/* Photo Evidence */}
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

        {/* Notes */}
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
      </View>

      {/* Submit Button - Fixed at bottom */}
      <View className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black to-transparent">
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={!allRequiredCompleted}
          className="w-full py-4 rounded-xl items-center flex-row justify-center"
          style={{
            backgroundColor: allRequiredCompleted ? '#00c2ff' : '#cbd5e1',
          }}
        >
          {allRequiredCompleted ? (
            <>
              <Ionicons name="checkmark-circle" size={20} color={allRequiredCompleted ? 'black' : '#64748b'} />
              <Text 
                className="ml-2 font-bold text-lg"
                style={{ color: allRequiredCompleted ? 'black' : '#64748b' }}
              >
                Complete Day {currentStreak + 1}
              </Text>
            </>
          ) : (
            <Text style={{ color: '#64748b' }} className="font-bold text-lg">
              Complete {requiredTasks.length - completedRequired} more required task{requiredTasks.length - completedRequired !== 1 ? 's' : ''}
            </Text>
          )}
        </TouchableOpacity>
        {!allRequiredCompleted && (
          <Text className="text-white/40 text-xs text-center mt-2">
            Finish all required tasks to mark today as complete
          </Text>
        )}
      </View>
    </ScrollView>
  );
}
