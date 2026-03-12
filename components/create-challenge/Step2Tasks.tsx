import React from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import { useCreateChallenge, type TaskDocument } from '@/hooks/useCreateChallenge';

interface Task {
  id: string;
  title: string;
  items: string[];
  isRecurring: boolean;
  days: string[];
  documents: TaskDocument[];
  youtubeLinks: string[];
}

interface Step2TasksProps {
  data: {
    tasks: Task[];
    usePDF: boolean;
  };
  onUpdate: (updates: Partial<Step2TasksProps['data']>) => void;
}

// ISO 8601 day numbers: 1=Monday through 7=Sunday
const DAYS_OF_WEEK = [
  { id: '1', label: 'M', full: 'Monday' },
  { id: '2', label: 'T', full: 'Tuesday' },
  { id: '3', label: 'W', full: 'Wednesday' },
  { id: '4', label: 'T', full: 'Thursday' },
  { id: '5', label: 'F', full: 'Friday' },
  { id: '6', label: 'S', full: 'Saturday' },
  { id: '7', label: 'S', full: 'Sunday' },
];

function isValidYouTubeUrl(url: string): boolean {
  return /(?:youtube\.com|youtu\.be)/.test(url);
}

export function Step2Tasks({ data, onUpdate }: Step2TasksProps) {
  const [currentLinks, setCurrentLinks] = React.useState<Record<string, string>>({});
  const [currentItems, setCurrentItems] = React.useState<Record<string, string>>({});
  const [uploadingDocForTask, setUploadingDocForTask] = React.useState<string | null>(null);
  const { uploadTaskDocument } = useCreateChallenge();

  const addTask = () => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: '',
      items: [],
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
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: [
          'application/pdf',
          'image/*',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ],
      });

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        setUploadingDocForTask(taskId);

        try {
          const publicUrl = await uploadTaskDocument(
            asset.uri,
            asset.name,
            asset.mimeType || 'application/octet-stream',
          );

          const task = data.tasks.find(t => t.id === taskId);
          if (task) {
            updateTask(taskId, {
              documents: [...task.documents, { url: publicUrl, name: asset.name }],
            });
          }
        } finally {
          setUploadingDocForTask(null);
        }
      }
    } catch (error: any) {
      setUploadingDocForTask(null);
      Alert.alert('Error', error?.message || 'Failed to upload document');
    }
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
    if (!link) return;

    if (!isValidYouTubeUrl(link)) {
      Alert.alert('Invalid URL', 'Please enter a valid YouTube link.');
      return;
    }

    const task = data.tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, {
        youtubeLinks: [...task.youtubeLinks, link]
      });
      setCurrentLinks({ ...currentLinks, [taskId]: '' });
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

  const addItem = (taskId: string) => {
    const item = currentItems[taskId]?.trim();
    if (item) {
      const task = data.tasks.find(t => t.id === taskId);
      if (task) {
        updateTask(taskId, {
          items: [...(task.items || []), item]
        });
        setCurrentItems({ ...currentItems, [taskId]: '' });
      }
    }
  };

  const removeItem = (taskId: string, index: number) => {
    const task = data.tasks.find(t => t.id === taskId);
    if (task) {
      updateTask(taskId, {
        items: (task.items || []).filter((_, i) => i !== index)
      });
    }
  };

  return (
    <ScrollView className="flex-1 bg-black px-6 py-6" showsVerticalScrollIndicator={false}>
      {/* Daily Tasks Header */}
      <View className="flex-row items-center justify-between mb-4">
        <Text className="text-white font-bold">Daily Tasks</Text>
      </View>

      {/* Tasks List */}
      {data.tasks.map((task, index) => (
        <View key={task.id} className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          {/* Task Header */}
          <View className="flex-row items-center justify-between mb-3">
            <Text className="text-white font-bold">Task {index + 1}</Text>
            {data.tasks.length > 1 && (
              <TouchableOpacity onPress={() => removeTask(task.id)}>
                <Ionicons name="trash-outline" size={20} color="#ef4444" />
              </TouchableOpacity>
            )}
          </View>

          {/* Task Title */}
          <TextInput
            value={task.title}
            onChangeText={(text) => updateTask(task.id, { title: text })}
            placeholder="Task name..."
            placeholderTextColor="rgba(255,255,255,0.4)"
            className="bg-black border border-white/20 rounded-lg px-3 py-3 text-white text-base mb-4"
          />

          {/* Checklist Items */}
          <View className="mb-3">
            <Text className="text-white/60 text-sm mb-2">Checklist Items</Text>
            <View className="flex-row gap-2">
              <TextInput
                value={currentItems[task.id] || ''}
                onChangeText={(text) => setCurrentItems({ ...currentItems, [task.id]: text })}
                placeholder="Add an item to check off..."
                placeholderTextColor="rgba(255,255,255,0.4)"
                className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-3 text-white"
                onSubmitEditing={() => addItem(task.id)}
              />
              <TouchableOpacity
                onPress={() => addItem(task.id)}
                className="items-center justify-center rounded-lg px-3"
                style={{ backgroundColor: '#00c2ff' }}
              >
                <Ionicons name="add" size={24} color="black" />
              </TouchableOpacity>
            </View>
            {/* Display added items */}
            {task.items && task.items.length > 0 && (
              <View className="mt-2 gap-1.5">
                {task.items.map((item, itemIndex) => (
                  <View key={itemIndex} className="flex-row items-center justify-between p-2.5 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <View className="flex-row items-center gap-2 flex-1">
                      <Ionicons name="checkmark-circle-outline" size={18} color="rgba(255,255,255,0.6)" />
                      <Text className="text-white text-sm flex-1">{item}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeItem(task.id, itemIndex)}>
                      <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.4)" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
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
              disabled={uploadingDocForTask === task.id}
              className="flex-row items-center justify-center gap-2 py-2.5 rounded-lg border border-white/20"
              style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
            >
              {uploadingDocForTask === task.id ? (
                <>
                  <ActivityIndicator size="small" color="rgba(255,255,255,0.6)" />
                  <Text className="text-white/60 text-sm">Uploading...</Text>
                </>
              ) : (
                <>
                  <Ionicons name="attach" size={18} color="rgba(255,255,255,0.6)" />
                  <Text className="text-white/60 text-sm">Upload Document</Text>
                </>
              )}
            </TouchableOpacity>
            {/* Display uploaded documents */}
            {task.documents.length > 0 && (
              <View className="mt-2 gap-1.5">
                {task.documents.map((doc, docIndex) => (
                  <View key={docIndex} className="flex-row items-center justify-between p-2 rounded-lg border border-white/10" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}>
                    <View className="flex-row items-center gap-2 flex-1">
                      <Ionicons name="document" size={16} color="rgba(255,255,255,0.6)" />
                      <Text className="text-white/60 text-xs flex-1" numberOfLines={1}>{doc.name}</Text>
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
                className="flex-1 bg-black border border-white/20 rounded-lg px-3 py-3 text-white text-sm"
                keyboardType="url"
                autoCapitalize="none"
                onSubmitEditing={() => addYoutubeLink(task.id)}
              />
              <TouchableOpacity
                onPress={() => addYoutubeLink(task.id)}
                className="items-center justify-center rounded-lg px-3"
                style={{ backgroundColor: '#ef4444' }}
              >
                <Ionicons name="add" size={24} color="white" />
              </TouchableOpacity>
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
