import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Step1Basics } from '@/components/create-challenge/Step1Basics';
import { Step2Tasks } from '@/components/create-challenge/Step2Tasks';
import { Step3ShareLink } from '@/components/create-challenge/Step3ShareLink';

interface ChallengeData {
  // Step 1
  title: string;
  description: string;
  duration: string;
  durationType: 'days' | 'weeks';
  startDate: Date;
  challengeType: 'personal' | 'group';
  selectedGroup: string | null;
  image: string | null;
  // Step 2
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    isRecurring: boolean;
    days: string[];
    documents: string[];
    youtubeLinks: string[];
  }>;
  usePDF: boolean;
  // Step 3 - Challenge UUID for sharing (generated when publishing)
  challengeUuid: string;
}

export default function CreateChallengeScreen() {
  const [step, setStep] = useState(1);
  const [challengeData, setChallengeData] = useState<ChallengeData>({
    // Step 1
    title: '',
    description: '',
    duration: '30',
    durationType: 'days',
    startDate: new Date(),
    challengeType: 'personal',
    selectedGroup: null,
    image: null,
    // Step 2
    tasks: [
      {
        id: '1',
        title: '',
        description: '',
        isRecurring: false,
        days: [],
        documents: [],
        youtubeLinks: [],
      },
    ],
    usePDF: false,
    // Step 3 - Generate UUID for challenge
    challengeUuid: Date.now().toString() + Math.random().toString(36).substr(2, 9),
  });

  const updateData = (updates: Partial<ChallengeData>) => {
    setChallengeData((prev) => ({ ...prev, ...updates }));
  };

  // Personal: 2 steps (Basic + Tasks)
  // Group: 3 steps (Basic + Tasks + Share Link)
  const totalSteps = challengeData.challengeType === 'personal' ? 2 : 3;

  const validateStep = (currentStep: number): boolean => {
    switch (currentStep) {
      case 1:
        if (!challengeData.title.trim()) {
          Alert.alert('Required', 'Please enter a challenge title');
          return false;
        }
        if (!challengeData.description.trim()) {
          Alert.alert('Required', 'Please enter a description');
          return false;
        }
        if (!challengeData.duration || parseInt(challengeData.duration) <= 0) {
          Alert.alert('Required', 'Please enter a valid duration');
          return false;
        }
        if (challengeData.challengeType === 'group' && !challengeData.selectedGroup) {
          Alert.alert('Required', 'Please select a group');
          return false;
        }
        return true;

      case 2:
        if (challengeData.usePDF) return true;
        const hasValidTasks = challengeData.tasks.some(task => task.title.trim().length > 0);
        if (!hasValidTasks) {
          Alert.alert('Required', 'Please add at least one task with a title');
          return false;
        }
        return true;

      case 3:
        // Step 3 is just for sharing the link - no validation needed
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (!validateStep(step)) return;

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      Alert.alert(
        'Discard Challenge?',
        'Are you sure you want to go back? Your progress will be lost.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Discard', style: 'destructive', onPress: () => router.back() },
        ]
      );
    }
  };

  const handleComplete = () => {
    // TODO: Save to Supabase
    console.log('Challenge Data:', challengeData);
     
  };

  const getStepTitle = () => {
    switch (step) {
      case 1:
        return 'Basic Information';
      case 2:
        return 'Tasks & Schedule';
      case 3:
        return 'Share Your Challenge';
      default:
        return '';
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-black">
      {/* Header */}
      <View className="px-6 py-4 border-b border-white/10">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-white text-2xl font-bold">Create Challenge</Text>
            <Text className="text-white/60 text-sm mt-1">{getStepTitle()}</Text>
          </View>
          <TouchableOpacity onPress={handleBack}>
            <Ionicons name="close" size={28} color="white" />
          </TouchableOpacity>
        </View>

        {/* Progress Indicator */}
        <View className="flex-row gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <View
              key={index}
              className="flex-1 h-1 rounded-full"
              style={{
                backgroundColor: index < step ? '#00c2ff' : 'rgba(255,255,255,0.1)',
              }}
            />
          ))}
        </View>

        {/* Step Counter */}
        <Text className="text-white/40 text-xs mt-3">
          Step {step} of {totalSteps}
        </Text>
      </View>

      {/* Step Content */}
      <View className="flex-1">
        {step === 1 && (
          <Step1Basics
            data={{
              title: challengeData.title,
              description: challengeData.description,
              duration: challengeData.duration,
              durationType: challengeData.durationType,
              startDate: challengeData.startDate,
              challengeType: challengeData.challengeType,
              selectedGroup: challengeData.selectedGroup,
              image: challengeData.image,
            }}
            onUpdate={updateData}
          />
        )}

        {step === 2 && (
          <Step2Tasks
            data={{
              tasks: challengeData.tasks,
              usePDF: challengeData.usePDF,
            }}
            onUpdate={updateData}
          />
        )}

        {step === 3 && challengeData.challengeType === 'group' && (
          <Step3ShareLink
            challengeId={challengeData.challengeUuid}
            challengeTitle={challengeData.title}
            onPublish={handleComplete}
          />
        )}
      </View>

      {/* Navigation Buttons - Hide on Step 3 for Group challenges (publish button is inside) */}
      {!(step === 3 && challengeData.challengeType === 'group') && (
        <View className="px-6 py-4 border-t border-white/10 flex-row gap-3">
          <TouchableOpacity
            onPress={handleBack}
            className="flex-1 py-4 rounded-xl border border-white/20 items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <Text className="text-white font-bold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            className="flex-1 py-4 rounded-xl items-center"
            style={{ backgroundColor: '#00c2ff' }}
          >
            <Text className="text-black font-bold">
              {step === totalSteps ? 'Publish Challenge' : step === 2 && challengeData.challengeType === 'group' ? 'Next' : 'Next: Tasks & Schedule'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
