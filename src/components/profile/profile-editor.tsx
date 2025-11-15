'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Loader2, User, Save, Camera, School, KeyRound, BookCopy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { useUser } from '@/hooks/use-user-role';
import { PlaceHolderImages } from '@/lib/placeholder-images';

const profileSchema = z
  .object({
    name: z.string().min(2, { message: 'Name must be at least 2 characters.' }),
    role: z.enum(['Student', 'Teacher', 'Parent']),
    institutionName: z.string().optional(),
    class: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.role === 'Student') {
        return data.institutionName && data.institutionName.length > 0;
      }
      return true;
    },
    {
      message: 'Institution name is required for students.',
      path: ['institutionName'],
    }
  )
  .refine(
    (data) => {
        if (data.role === 'Student') {
            return data.class && data.class.length > 0;
        }
        return true;
    },
    {
        message: 'Please select a class.',
        path: ['class'],
    }
  );

export function ProfileEditor() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { userRole, setUserRole, userName, setUserName, userAvatar, setUserAvatar } = useUser();
  const profileBgImage = PlaceHolderImages.find(img => img.id === 'profile-card-background');

  const form = useForm<z.infer<typeof profileSchema>>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: userName,
      role: userRole,
      institutionName: 'State University',
      class: '10th Grade',
    },
  });

  const watchRole = form.watch('role');

  useEffect(() => {
    form.setValue('role', userRole);
  }, [userRole, form]);

  useEffect(() => {
    form.setValue('name', userName);
  }, [userName, form]);

  async function onSubmit(values: z.infer<typeof profileSchema>) {
    setIsLoading(true);
    const submissionValues = { ...values };
    if (submissionValues.role !== 'Student') {
      delete submissionValues.institutionName;
      delete submissionValues.class;
    }
    console.log(submissionValues);
    setUserRole(submissionValues.role); // Update global role state
    setUserName(submissionValues.name);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsLoading(false);
    toast({
      title: 'Profile Updated',
      description: 'Your information has been saved successfully.',
    });
  }

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserAvatar(reader.result as string);
        toast({
            title: "Picture updated!",
            description: "Your new profile picture has been set."
        })
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  };


  return (
    <>
      <div className="grid md:grid-cols-3 gap-8">
        <Card className="md:col-span-1 relative overflow-hidden">
          {profileBgImage && (
            <Image
                src={profileBgImage.imageUrl}
                alt={profileBgImage.description}
                layout="fill"
                objectFit="cover"
                className="opacity-20"
                data-ai-hint={profileBgImage.imageHint}
            />
          )}
          <div className="absolute inset-0 bg-background/50 dark:bg-background/70" />
          <div className="relative z-10 h-full flex flex-col">
            <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center gap-4 flex-grow">
                <Avatar className="h-32 w-32 border-4 border-background/50 shadow-lg">
                <AvatarImage src={userAvatar} alt="User avatar" />
                <AvatarFallback>
                    <User className="h-16 w-16" />
                </AvatarFallback>
                </Avatar>
                <input
                type="file"
                ref={fileInputRef}
                onChange={handleAvatarChange}
                className="hidden"
                accept="image/*"
                />
                <Button
                variant="secondary"
                onClick={() => fileInputRef.current?.click()}
                >
                <Camera className="mr-2 h-4 w-4" />
                Change Picture
                </Button>
            </CardContent>
          </div>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>
              Update your name and role here.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormItem>
                  <FormLabel>User ID</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        value="user-123"
                        disabled
                        className="pl-10"
                      />
                    </div>
                  </FormControl>
                </FormItem>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a role" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Student">Student</SelectItem>
                          <SelectItem value="Teacher">Teacher</SelectItem>
                          <SelectItem value="Parent">Parent</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div
                  className={cn(
                    'transition-all duration-300 ease-in-out space-y-6',
                    watchRole === 'Student'
                      ? 'opacity-100 max-h-96'
                      : 'opacity-0 max-h-0 overflow-hidden'
                  )}
                >
                  {watchRole === 'Student' && (
                    <>
                    <FormField
                        control={form.control}
                        name="class"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Class</FormLabel>
                                <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value}
                                >
                                <FormControl>
                                    <div className="relative">
                                        <BookCopy className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <SelectTrigger className='pl-10'>
                                            <SelectValue placeholder="Select your class" />
                                        </SelectTrigger>
                                    </div>
                                </FormControl>
                                <SelectContent>
                                    <SelectItem value="6th Grade">6th Grade</SelectItem>
                                    <SelectItem value="7th Grade">7th Grade</SelectItem>
                                    <SelectItem value="8th Grade">8th Grade</SelectItem>
                                    <SelectItem value="9th Grade">9th Grade</SelectItem>
                                    <SelectItem value="10th Grade">10th Grade</SelectItem>
                                    <SelectItem value="11th Grade">11th Grade</SelectItem>
                                    <SelectItem value="12th Grade">12th Grade</SelectItem>
                                    <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                                </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                    <FormField
                      control={form.control}
                      name="institutionName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Institution Name</FormLabel>
                          <FormControl>
                            <div className="relative">
                              <School className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                              <Input
                                placeholder="e.g., 'State University'"
                                {...field}
                                className="pl-10"
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    </>
                  )}
                </div>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="mr-2 h-4 w-4" />
                  )}
                  Save Changes
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
