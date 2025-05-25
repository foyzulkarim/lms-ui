import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Form validation schema
const lessonFormSchema = z.object({
  title: z.string().min(3, "Lesson title must be at least 3 characters"),
  content: z.string().optional(),
  duration: z.string().optional(),
  videoUrl: z.string().optional(),
});

type LessonFormValues = z.infer<typeof lessonFormSchema>;

interface LessonEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  lesson?: {
    _id?: string;
    title: string;
    content?: string;
    videoUrl?: string;
    duration?: string;
  };
  moduleId: string;
  courseId: string;
  order: number;
  onSave: (lessonData: any) => Promise<void>;
}

export default function LessonEditModal({
  isOpen,
  onClose,
  lesson,
  moduleId,
  courseId,
  order,
  onSave,
}: LessonEditModalProps) {
  const { toast } = useToast();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUrlInput, setIsUrlInput] = useState(lesson?.videoUrl ? true : false);

  // Form setup
  const form = useForm<LessonFormValues>({
    resolver: zodResolver(lessonFormSchema),
    defaultValues: {
      title: lesson?.title || "",
      content: lesson?.content || "",
      duration: lesson?.duration || "",
      videoUrl: lesson?.videoUrl || "",
    },
  });

  // Handle video file upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setVideoFile(file);
      
      // Create a preview URL for the video
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setVideoPreviewUrl(reader.result);
        }
      };
      reader.readAsDataURL(file);

      // Simulate upload to demonstrate UI
      simulateVideoUpload(file);
    }
  };

  // Simulate video upload progress - in a real app this would be a real upload
  const simulateVideoUpload = (file: File) => {
    setIsUploading(true);
    setUploadProgress(0);
    
    const totalSize = file.size;
    let uploadedSize = 0;
    const chunkSize = totalSize / 10; // 10 steps
    
    const uploadInterval = setInterval(() => {
      uploadedSize += chunkSize;
      const progress = Math.min(Math.round((uploadedSize / totalSize) * 100), 100);
      setUploadProgress(progress);
      
      if (progress >= 100) {
        clearInterval(uploadInterval);
        setIsUploading(false);
        
        // Set a mock video URL (in a real app, this would be the uploaded file URL)
        const mockVideoUrl = `https://example.com/videos/${file.name.replace(/\s+/g, '-')}`;
        form.setValue("videoUrl", mockVideoUrl);
        
        toast({
          title: "Video uploaded successfully",
          description: `Your video "${file.name}" has been uploaded.`,
        });
      }
    }, 500);
  };

  // Cancel video upload
  const cancelUpload = () => {
    setIsUploading(false);
    setUploadProgress(0);
    setVideoFile(null);
    setVideoPreviewUrl(null);
  };

  // Remove video
  const removeVideo = () => {
    form.setValue("videoUrl", "");
    setVideoFile(null);
    setVideoPreviewUrl(null);
  };

  // Form submission
  const onSubmit = async (data: LessonFormValues) => {
    try {
      const lessonData = {
        ...data,
        moduleId,
        courseId,
        order,
        _id: lesson?._id
      };

      await onSave(lessonData);
      
      toast({
        title: "Success",
        description: `Lesson ${lesson?._id ? "updated" : "created"} successfully!`,
      });
      
      onClose();
    } catch (error) {
      console.error("Error saving lesson:", error);
      toast({
        title: "Error",
        description: "There was a problem saving the lesson.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{lesson?._id ? "Edit" : "Add"} Lesson</DialogTitle>
          <DialogDescription>
            {lesson?._id
              ? "Update the lesson details below."
              : "Fill in the details to create a new lesson."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Lesson Title */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Title</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Introduction to React Hooks"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Lesson Content */}
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Lesson Content</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Enter lesson content or description..."
                      className="min-h-[150px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Video Upload */}
            <div className="space-y-2">
              <FormLabel>Lesson Video</FormLabel>
              <div className="flex items-center space-x-2 mb-2">
                <Button
                  type="button"
                  variant={!isUrlInput ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsUrlInput(false)}
                >
                  Upload Video
                </Button>
                <Button
                  type="button"
                  variant={isUrlInput ? "default" : "outline"}
                  size="sm"
                  onClick={() => setIsUrlInput(true)}
                >
                  Video URL
                </Button>
              </div>
              
              {isUrlInput ? (
                <FormField
                  control={form.control}
                  name="videoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <Input
                          placeholder="Enter video URL (YouTube, Vimeo, or direct video link)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : !form.watch("videoUrl") && !isUploading ? (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    id="video-upload"
                    className="hidden"
                    accept="video/*"
                    onChange={handleVideoUpload}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="video-upload"
                    className="flex flex-col items-center justify-center cursor-pointer"
                  >
                    <Upload className="h-10 w-10 text-gray-400 mb-2" />
                    <span className="text-sm font-medium text-gray-900">
                      Upload video
                    </span>
                    <span className="text-xs text-gray-500 mt-1">
                      MP4, WebM, or Ogg (Max 100MB)
                    </span>
                  </label>
                </div>
              ) : isUploading ? (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="mr-2">
                        <Loader2 className="h-5 w-5 animate-spin text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {videoFile?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {uploadProgress}% uploaded
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={cancelUpload}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                </div>
              ) : (
                <div className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="mr-2 bg-gray-100 rounded-md p-2">
                        <video
                          className="h-12 w-20 object-cover"
                          src={videoPreviewUrl || form.watch("videoUrl") || ""}
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {videoFile?.name || "Video uploaded"}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(() => {
                            const videoUrl = form.watch("videoUrl");
                            if (!videoUrl) return "URL: N/A";
                            return videoUrl.length > 25 
                              ? `URL: ${videoUrl.substring(0, 25)}...` 
                              : `URL: ${videoUrl}`;
                          })()}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          document.getElementById("video-upload")?.click();
                        }}
                      >
                        Replace
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeVideo}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (hh:mm:ss)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., 00:15:30"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isUploading}
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `${lesson?._id ? "Update" : "Create"} Lesson`
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
