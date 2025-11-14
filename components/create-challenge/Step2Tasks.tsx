import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
// TODO: Uncomment after app rebuild with: npx expo prebuild
// import * as DocumentPicker from 'expo-document-picker';

interface Task {
  id: string;
  title: string;
  description: string;
  isRecurring: boolean;
  days: string[];
  documents: string[];
  youtubeLinks: string[];
}

interface Step2TasksProps {
  data: {
    tasks: Task[];
    usePDF: boolean;
  };
  onUpdate: (updates: Partial<Step2TasksProps['data']>) => void;
}

const DAYS_OF_WEEK = [
  { id: 'monday', label: 'M', full: 'Monday' },
  { id: 'tuesday', label: 'T', full: 'Tuesday' },
  { id: 'wednesday', label: 'W', full: 'Wednesday' },
  { id: 'thursday', label: 'T', full: 'Thursday' },
  { id: 'friday', label: 'F', full: 'Friday' },
  { id: 'saturday', label: 'S', full: 'Saturday' },
  { id: 'sunday', label: 'S', full: 'Sunday' },
];

export function Step2Tasks({ data, onUpdate }: Step2TasksProps) {
  const [currentLinks, setCurrentLinks] = React.useState<Record<string, string>>({});

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '',
      description: '',
      isRecurring: false,
      days: [],
      documents: [],
      youtubeLinks: [],
    };
    onUpdate({ tasks: [...data.tasks, newTask] });
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    const updatedTasks = data.tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    onUpdate({ tasks: updatedTasks });
  };

  const removeTask = (taskId: string) => {
    if (data.tasks.length <= 1) {
      Alert.alert('Error', 'At least one task is required');
      return;
    }
    onUpdate({ tasks: data.tasks.filter(task => task.id !== taskId) });
  };

  const toggleDay = (taskId: string, dayId: string) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task) return;

    const days = task.days.includes(dayId)
      ? task.days.filter(d => d !== dayId)
      : [...task.days, dayId];

    updateTask(taskId, { days });
  };

  if (data.usePDF) {
    return (
      <ScrollView className="flex-1 bg-black px-6 py-6">
        <View className="items-center justify-center py-12">
          <View className="w-20 h-20 rounded-full bg-white/5 items-center justify-center mb-4">
            <Ionicons name="document-text" size={40} color="rgba(255,255,255,0.4)" />
          </View>
          <Text className="text-white text-lg font-bold mb-2">PDF Upload</Text>
          <Text className="text-white/60 text-center mb-6 px-8">
            Upload a PDF with your pre-defined checklist
          </Text>
          <TouchableOpacity
            className="px-6 py-3 rounded-xl flex-row items-center gap-2"
            style={{ backgroundColor: '#00c2ff' }}
          >
            <Ionicons name="cloud-upload" size={20} color="black" />
            <Text className="text-black font-bold">Choose PDF File</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => onUpdate({ usePDF: false })}
            className="mt-4"
          >
            <Text className="text-white/60">Or create tasks manually</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    );
  }

  const handleDocumentPick = async (taskId: string) => {
    // TODO: Uncomment after app rebuild with expo-document-picker
    // try {
    //   const result = await DocumentPicker.getDocumentAsync({
    //     type: ['application/pdf', 'image/*'],
    //   });
    //   if (!result.canceled) {
    //     const task = data.tasks.find(t => t.id === taskId);
    //     if (task) {
    //       updateTask(taskId, {
    //         documents: [...task.documents, result.assets[0].name]
    //       });
    //     }
    //   }
    // } catch (error) {
    //   Alert.alert('Error', 'Failed to pick document');
    // }
    
    // Temporary placeholder - shows message until app is rebuilt
    Alert.alert(
      'Coming Soon',
      'Document upload requires expo-document-picker package. The app needs to be rebuilt.\n\nFor now, you can continue creating the challenge without documents.',
      [{ text: 'OK' }]
    );
  };

  const removeDocument = (taskId: string, index: number) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, {
        documents: task.documents.filter((_, i) => i !== index)
      });
    }
  };

  const addYoutubeLink = (taskId: string) => {
    const link = currentLinks[taskId]?.trim();
    if (link) {
      const task = data.tasks.find(t => t.id === taskId);
      if (task) {
        updateTask(taskId, {
          youtubeLinks: [...task.youtubeLinks, link]
        });
        setCurrentLinks({ ...currentLinks, [taskId]: '' });
      }
    }
  };

  const removeYoutubeLink = (taskId: string, index: number) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, {
        youtubeLinks: task.youtubeLinks.filter((_, i) => i !== index)
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-6" showsVerticalScrollIndicator={false}>
      {/* Upload AI-Generated Plan Card */}
      {/* <View className="mb-6 p-4 rounded-2xl border border-white/20" style={{ backgroundColor: 'rgba(0, 194, 255, 0.1)' }}>
        <Text className="text-white font-bold text-base mb-2">Upload AI-Generated Plan (Optional)</Text>
        <Text className="text-white/70 text-sm mb-4">
          Have a PDF plan? Upload it and we'll automatically parse it into tasks!
        </Text>
        <TouchableOpacity
          onPress={() => onUpdate({ usePDF: true })}
          className="flex-row items-center justify-center gap-2 py-3 rounded-xl"
          style={{ backgroundColor: 'rgba(255,255,255,0.15)' }}
        >
          <Ionicons name="document" size={20} color="white" />
          <Text className="text-white font-bold">Upload PDF Plan</Text>
        </TouchableOpacity>
      </View> */}

      {/* Daily Tasks Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white font-bold">Daily Tasks</Text>
      </View>

      {/* Tasks List */}
      {data.tasks.map((task, index) => (
        <View key={task.id} className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          {/* Task Header */}
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-white font-bold">Task {index + 1}</Text>
            {data.tasks.length > 1 && (
              <TouchableOpacity onPress={() => removeTask(task.id)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* Task Title */}
          <View className="mb-3">
            <Text className="text-white/60 text-sm mb-2">Task Title *</Text>
            <TextInput
              value={task.title}
              onChangeText={(text) => updateTask(task.id, { title: text })}
              placeholder="e.g., 20 minutes cardio"
              placeholderTextColor="rgba(255,255,255,0.4)"
              className="bg-black border border-white/20 rounded-lg px-3 py-2 text-white"
            />
          </View>

          {/* Task Description */}
          <View className="mb-3">
            <Text className="text-white/60 text-sm mb-2">Description (Optional)</Text>
            <TextInput
              value={task.description}
              onChangeText={(text) => updateTask(task.id, { description: text })}
              placeholder="Add details..."
              placeholderTextColor="rgba(255,255,255,0.4)"
              multiline
              numberOfLines={2}
              className="bg-black border border-white/20 rounded-lg px-3 py-2 text-white"
              style={{ textAlignVertical: 'top' }}
            />
          </View>

          {/* Recurring Toggle */}
          <TouchableOpacity
            onPress={() => updateTask(task.id, { isRecurring: !task.isRecurring, days: [] })}
            className="flex-row items-center justify-between py-3 border-t border-white/10"
          >
            <View className="flex-row items-center gap-2">
              <Ionicons name="repeat" size={20} color="rgba(255,255,255,0.6)" />
              <Text className="text-white">Recurring Task</Text>
            </View>
            <View
              className="w-12 h-7 rounded-full p-1"
              style={{ backgroundColor: task.isRecurring ? '#00c2ff' : 'rgba(255,255,255,0.2)' }}
            >
              <View
                className="w-5 h-5 rounded-full bg-white"
                style={{ marginLeft: task.isRecurring ? 16 : 0 }}
              />
            </View>
          </TouchableOpacity>

          {/* Day Selector (if recurring) */}
          {task.isRecurring && (
            <View className="mt-3">
              <Text className="text-white/60 text-sm mb-2">Select Days</Text>
              <View className="flex-row flex-wrap gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <TouchableOpacity
                    key={day.id}
                    onPress={() => toggleDay(task.id, day.id)}
                    className="px-3 py-2 rounded-lg border"
                    style={{
                      backgroundColor: task.days.includes(day.id) ? '#00c2ff' : 'rgba(255,255,255,0.05)',
                      borderColor: task.days.includes(day.id) ? '#00c2ff' : 'rgba(255,255,255,0.1)',
                    }}
                  >
                    <Text className={task.days.includes(day.id) ? 'text-black font-bold' : 'text-white/60'}>
                      {day.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Documents Section */}
          <View className="mt-4 pt-4 border-t border-white/10">
            <Text className="text-white/60 text-sm mb-2">Documents (Optional)</Text>
            <TouchableOpacity
              onPress={() => handleDocumentPick(task.id)}
              className="flex-row items-center justify-center gap-2 py-2.5 rounded-lg border border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              <Ionicons name="attach" size={18} color="rgba(255,255,255,0.6)" />
              <Text className="text-white/60 text-sm">Upload Document</Text>
            </TouchableOpacity>
            {/* Display uploaded documents */}
            {task.documents.length > 0 && (
              <View className="mt-2 gap-1.5">
                {task.documents.map((doc, docIndex) => (
                  <View key={docIndex} className="flex-row items-center justify-between p-2 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <View className="flex-row items-center gap-2 flex-1">
                      <Ionicons name="document" size={16} color="rgba(255,255,255,0.6)" />
                      <Text className="text-white/60 text-xs flex-1" numberOfLines={1}>{doc}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeDocument(task.id, docIndex)}>
                      <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>

          {/* YouTube Links Section */}
          <View className="mt-4 pt-4 border-t border-white/10">
            <Text className="text-white/60 text-sm mb-2">Youtube Links (Optional)</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={currentLinks[task.id] || ''}
                onChangeText={(text) => setCurrentLinks({ ...currentLinks, [task.id]: text })}
                placeholder="https://www.youtube.com/watch?v=..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                keyboardType="url"
                autoCapitalize="none"
              />
             
            </View>
            {/* Display added links */}
            {task.youtubeLinks.length > 0 && (
              <View className="mt-2 gap-1.5">
                {task.youtubeLinks.map((link, linkIndex) => (
                  <View key={linkIndex} className="flex-row items-center justify-between p-2 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <View className="flex-row items-center gap-2 flex-1">
                      <Ionicons name="logo-youtube" size={16} color="#ef4444" />
                      <Text className="text-white/60 text-xs flex-1" numberOfLines={1}>{link}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeYoutubeLink(task.id, linkIndex)}>
                      <Ionicons name="close-circle" size={18} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      ))}

      {/* Add Task Button */}
      <TouchableOpacity
        onPress={addTask}
        className="flex-row items-center justify-center gap-2 p-4 border-2 border-dashed border-white/20 rounded-xl"
      >
        <Ionicons name="add-circle-outline" size={24} color="rgba(255,255,255,0.6)" />
        <Text className="text-white/60 font-medium">Add Another Task</Text>
      </TouchableOpacity>

      {/* Bottom spacing */}
      <View style={{ height: 100 }} />
    </ScrollView>
  );
}
