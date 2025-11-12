import { useState } from 'react';
import { Check, Camera, FileText, Flame, X } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Checkbox } from '../ui/checkbox';
import { Badge } from '../ui/badge';
import { Card } from '../ui/card';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import { toast } from 'sonner@2.0.3';

const todaysTasks = [
  { id: 't1', title: '20 minutes cardio', completed: true, required: true },
  { id: 't2', title: '3 sets of strength training', completed: true, required: true },
  { id: 't3', title: 'Log meals', completed: false, required: true },
  { id: 't4', title: 'Drink 8 glasses of water', completed: false, required: false },
];

export default function TaskTrackerTab() {
  const [tasks, setTasks] = useState(todaysTasks);
  const [note, setNote] = useState('');
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [currentStreak, setCurrentStreak] = useState(15);

  const completedCount = tasks.filter(t => t.completed).length;
  const requiredTasks = tasks.filter(t => t.required);
  const completedRequired = requiredTasks.filter(t => t.completed).length;
  const allRequiredCompleted = completedRequired === requiredTasks.length;

  const toggleTask = (taskId: string) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, completed: !task.completed } : task
    ));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = () => {
    if (allRequiredCompleted) {
      toast.success('Great work! Day 16 completed! 🎉', {
        description: 'Your streak continues!'
      });
      setCurrentStreak(currentStreak + 1);
    } else {
      toast.error('Complete all required tasks first', {
        description: 'You need to finish all required tasks to mark the day as complete.'
      });
    }
  };

  return (
    <div className="p-4 space-y-6 pb-24">
      {/* Streak Info */}
      <div className="p-6 rounded-2xl shadow-lg text-white" style={{ backgroundColor: '#f97316' }}>
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Flame className="w-6 h-6 text-white" />
              <span className="text-white">Current Streak</span>
            </div>
            <div className="text-4xl">{currentStreak} days</div>
            <p className="text-sm text-white/80 mt-1">Keep going! You're doing amazing!</p>
          </div>
          <div className="text-right">
            <div className="text-white/80 mb-1">Today's Progress</div>
            <div className="text-3xl">{completedCount}/{tasks.length}</div>
            <div className="text-xs text-white/80 mt-1">tasks completed</div>
          </div>
        </div>
      </div>

      {/* Today's Tasks */}
      <div>
        <h3 className="text-slate-900 mb-4">Today's Tasks</h3>
        
        <div className="space-y-3">
          {tasks.map((task) => (
            <button
              key={task.id}
              onClick={() => toggleTask(task.id)}
              className="w-full text-left p-4 rounded-xl border-2 transition-all"
              style={
                task.completed 
                  ? { backgroundColor: '#e0f7ff', borderColor: '#a0e0ff' }
                  : { backgroundColor: 'white', borderColor: '#e2e8f0' }
              }
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div 
                    className="w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all"
                    style={
                      task.completed 
                        ? { backgroundColor: '#00c2ff', borderColor: '#00c2ff' }
                        : { borderColor: '#cbd5e1' }
                    }
                  >
                    {task.completed && <Check className="w-4 h-4 text-white" />}
                  </div>
                  <span className={`${task.completed ? 'text-slate-500 line-through' : 'text-slate-900'}`}>
                    {task.title}
                  </span>
                </div>
                {task.required && !task.completed && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                    Required
                  </Badge>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Photo Evidence */}
      <div>
        <h4 className="text-slate-900 mb-3">Add Photo Evidence (Optional)</h4>
        
        {uploadedImage ? (
          <div className="relative rounded-xl overflow-hidden">
            <ImageWithFallback
              src={uploadedImage}
              alt="Uploaded evidence"
              className="w-full h-64 object-cover"
            />
            <button
              onClick={() => setUploadedImage(null)}
              className="absolute top-3 right-3 w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <label className="block cursor-pointer">
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:border-emerald-400 transition-colors bg-white">
              <Camera className="w-12 h-12 text-slate-400 mx-auto mb-3" />
              <p className="text-slate-600 mb-1">Upload a photo</p>
              <p className="text-sm text-slate-500">Show your progress!</p>
            </div>
          </label>
        )}
      </div>

      {/* Notes */}
      <div>
        <h4 className="text-slate-900 mb-3">Add Notes (Optional)</h4>
        <div className="relative">
          <FileText className="absolute left-3 top-3 w-5 h-5 text-slate-400" />
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="How did today go? Any reflections or wins to share?"
            className="pl-10 min-h-[120px] bg-white border-slate-200 rounded-xl resize-none"
          />
        </div>
      </div>

      {/* Submit Button */}
      <div className="mx-4 fixed bottom-20 left-0 right-0 p-4 bg-gradient-to-t from-white via-white to-transparent">
        <div className="max-w-2xl mx-auto">
          <Button
            onClick={handleSubmit}
            disabled={!allRequiredCompleted}
            className="w-full py-6 rounded-xl text-white"
            style={{
              backgroundColor: allRequiredCompleted ? '#00c2ff' : '#cbd5e1',
              color: allRequiredCompleted ? 'white' : '#64748b',
              cursor: allRequiredCompleted ? 'pointer' : 'not-allowed'
            }}
            onMouseEnter={(e) => {
              if (allRequiredCompleted) e.currentTarget.style.backgroundColor = '#00a8e0';
            }}
            onMouseLeave={(e) => {
              if (allRequiredCompleted) e.currentTarget.style.backgroundColor = '#00c2ff';
            }}
          >
            {allRequiredCompleted ? (
              <>
                <Check className="w-5 h-5 mr-2" />
                Complete Day {currentStreak + 1}
              </>
            ) : (
              `Complete ${requiredTasks.length - completedRequired} more required task${requiredTasks.length - completedRequired !== 1 ? 's' : ''}`
            )}
          </Button>
          {!allRequiredCompleted && (
            <p className="text-xs text-center text-slate-500 mt-2">
              Finish all required tasks to mark today as complete
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
