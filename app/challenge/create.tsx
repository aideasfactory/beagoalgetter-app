import { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Step1Basics } from '@/components/create-challenge/Step1Basics';
import { Step2Tasks } from '@/components/create-challenge/Step2Tasks';
import { Step3ShareLink } from '@/components/create-challenge/Step3ShareLink';
import { useCreateChallenge, type TaskDocument } from '@/hooks/useCreateChallenge';

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
  imageUrl: string | null;
  // Step 2
  tasks: Array<{
    id: string;
    title: string;
    description: string;
    items: string[];
    isRecurring: boolean;
    days: string[];
    documents: TaskDocument[];
    youtubeLinks: string[];
  }>;
  usePDF: boolean;
}

export default function CreateChallengeScreen() {
  const [step, setStep] = useState(1);
  const { uploadChallengeImage, createChallenge, isUploading, isCreating } = useCreateChallenge();
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
    imageUrl: null,
    // Step 2
    tasks: [
      {
        id: '1',
        title: '',
        description: '',
        items: [],
        isRecurring: false,
        days: [],
        documents: [],
        youtubeLinks: [],
      },
    ],
    usePDF: false,
  });

  const isLoading = isUploading || isCreating;

  const updateData = (updates: Partial<ChallengeData>) => {
    setChallengeData((prev) => {
      const next = { ...prev, ...updates };
      // Clear imageUrl when image is removed
      if ('image' in updates && updates.image === null) {
        next.imageUrl = null;
      }
      return next;
    });
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
        return true;

      default:
        return true;
    }
  };

  const handleNext = () => {
    if (isLoading) return;
    if (!validateStep(step)) return;

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (isLoading) return;
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

  const handleComplete = async () => {
    if (isLoading) return;

    try {
      // Upload image if one was picked but not yet uploaded
      let imageUrl = challengeData.imageUrl;
      if (challengeData.image && !imageUrl) {
        imageUrl = await uploadChallengeImage(challengeData.image);
      }

      // Create challenge + tasks + auto-join
      const challengeId = await createChallenge({
        title: challengeData.title,
        description: challengeData.description,
        duration: challengeData.duration,
        durationType: challengeData.durationType,
        startDate: challengeData.startDate,
        challengeType: challengeData.challengeType,
        selectedGroup: challengeData.selectedGroup,
        imageUrl,
        tasks: challengeData.tasks,
      });

      // For group challenges, skip the alert — Step3ShareLink shows its own success UI
      if (challengeData.challengeType !== 'group') {
        Alert.alert(
          'Challenge Created!',
          'Your challenge has been published successfully.',
          [
            {
              text: 'View Challenge',
              onPress: () => {
                router.replace(`/challenge/${challengeId}`);
              },
            },
            {
              text: 'Back to Challenges',
              onPress: () => {
                router.back();
              },
            },
          ]
        );
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error?.message || 'Failed to create challenge. Please try again.'
      );
    }
  };

  const handleImageUploaded = (imageUrl: string) => {
    updateData({ imageUrl: imageUrl || null });
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
          <TouchableOpacity onPress={handleBack} disabled={isLoading}>
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
            onImageUploaded={handleImageUploaded}
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
            challengeId=""
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
            disabled={isLoading}
            className="flex-1 py-4 rounded-xl border border-white/20 items-center"
            style={{ backgroundColor: 'rgba(255,255,255,0.05)' }}
          >
            <Text className="text-white font-bold">Back</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleNext}
            disabled={isLoading}
            className="flex-1 py-4 rounded-xl items-center flex-row justify-center gap-2"
            style={{ backgroundColor: isLoading ? 'rgba(0,194,255,0.5)' : '#00c2ff' }}
          >
            {isLoading ? (
              <>
                <ActivityIndicator size="small" color="black" />
                <Text className="text-black font-bold">
                  {isUploading ? 'Uploading...' : 'Creating...'}
                </Text>
              </>
            ) : (
              <Text className="text-black font-bold">
                {step === totalSteps ? 'Publish Challenge' : step === 2 && challengeData.challengeType === 'group' ? 'Next' : 'Tasks & Schedule'}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
}
