'use client';

import { useState, useRef, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import Image from 'next/image';
import {
  solveDoubt,
} from '@/ai/flows/doubt-solver';

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
import { useToast } from '@/hooks/use-toast';
import { Loader2, BrainCircuit, Send, User, Bot, ImagePlus, X } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useUser } from '@/hooks/use-user-role';


const formSchema = z.object({
  doubt: z.string(), // Now optional, but we'll enforce at least one field is present in onSubmit
});

const AnswerDisplay = ({ text }: { text: string }) => {
    const elements: JSX.Element[] = [];
    const lines = text.split('\n');
    let currentList: string[] = [];

    const renderList = () => {
        if (currentList.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc pl-6 my-2 space-y-1">
                    {currentList.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            );
            currentList = [];
        }
    };

    lines.forEach((line, index) => {
        const trimmedLine = line.trim();
        if (trimmedLine.startsWith('**') && trimmedLine.endsWith('**')) {
            renderList();
            elements.push(<h3 key={`h3-${index}`} className="text-lg font-semibold mt-4 mb-2 text-primary">{trimmedLine.replace(/\*\*/g, '')}</h3>);
        } else if (trimmedLine.startsWith('* ')) {
            currentList.push(trimmedLine.substring(2));
        } else if (trimmedLine === '') {
            renderList();
            if (elements.length > 0 && lines[index-1]?.trim() !== '') {
                elements.push(<div key={`br-${index}`} className="h-4" />);
            }
        } else {
            renderList();
            elements.push(<p key={`p-${index}`} className="leading-relaxed">{trimmedLine}</p>);
        }
    });

    renderList();
    return <div className="prose prose-sm max-w-none dark:prose-invert">{elements}</div>;
};

type Message = {
    sender: 'user' | 'ai';
    text: string;
    image?: string;
};

export function DoubtSolver() {
  const { toast } = useToast();
  const { userName } = useUser();
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { sender: 'ai', text: `Hello ${userName.split(' ')[0]}! I'm your AI Tutor. Ask a question or upload an image of a problem.` }
  ]);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      doubt: '',
    },
  });

  useEffect(() => {
    if (scrollAreaRef.current) {
        scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages]);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setImagePreview(null);
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  }

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!values.doubt && !imagePreview) {
        form.setError('doubt', { message: 'Please enter a question or upload an image.'});
        return;
    }
    setIsLoading(true);
    
    const userMessage: Message = { 
        sender: 'user', 
        text: values.doubt || "Please solve the problem in the image.",
        image: imagePreview || undefined,
    };
    setMessages(prev => [...prev, userMessage]);
    form.reset();
    removeImage();

    try {
      const response = await solveDoubt({ 
          doubt: values.doubt,
          photoDataUri: imagePreview || undefined,
        });
      const aiMessage: Message = { sender: 'ai', text: response.answer };
      setMessages(prev => [...prev, aiMessage]);

    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error Getting Answer',
        description: 'There was an issue getting an answer. Please try again.',
      });
      console.error(error);
      setMessages(prev => {
        const newMessages = [...prev];
        const lastMessage = newMessages[newMessages.length - 1];
        if (lastMessage.sender === 'user' && (lastMessage.text === values.doubt || lastMessage.text === "Please solve the problem in the image.")) {
            newMessages.pop();
        }
        return newMessages;
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BrainCircuit className="h-6 w-6 text-accent" />
          AI Tutor
        </CardTitle>
        <CardDescription>
          Ask a question about any academic subject to get a clear explanation.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg p-4 h-96 flex flex-col">
            <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                <div className="space-y-4">
                    {messages.map((message, index) => (
                        <div key={index} className={`flex items-start gap-3 ${message.sender === 'user' ? 'justify-end' : ''}`}>
                            {message.sender === 'ai' && (
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                                </Avatar>
                            )}
                            <div className={`rounded-lg p-3 max-w-lg ${message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>
                                {message.image && (
                                    <Image
                                        src={message.image}
                                        alt="User upload"
                                        width={200}
                                        height={200}
                                        className="rounded-md mb-2 max-w-full h-auto"
                                    />
                                )}
                                <AnswerDisplay text={message.text} />
                            </div>
                            {message.sender === 'user' && (
                                <Avatar className="w-8 h-8 border">
                                    <AvatarFallback>{userName.charAt(0)}</AvatarFallback>
                                </Avatar>
                            )}
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex items-start gap-3">
                            <Avatar className="w-8 h-8 border">
                                <AvatarFallback><Bot className="w-5 h-5"/></AvatarFallback>
                            </Avatar>
                            <div className="rounded-lg p-3 bg-muted flex items-center">
                                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>
            <div className="mt-4">
                {imagePreview && (
                    <div className="relative w-24 h-24 mb-2 border rounded-md p-1">
                        <Image src={imagePreview} alt="Image preview" layout="fill" objectFit="cover" className="rounded-md" />
                        <Button
                            variant="destructive"
                            size="icon"
                            className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                            onClick={removeImage}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                )}
                 <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex items-center gap-2">
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            className="hidden"
                            accept="image/*"
                        />
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={isLoading}
                        >
                            <ImagePlus className="h-5 w-5" />
                        </Button>
                        <FormField
                        control={form.control}
                        name="doubt"
                        render={({ field }) => (
                            <FormItem className="flex-1">
                            <FormLabel className="sr-only">Your Doubt</FormLabel>
                            <FormControl>
                                <Input
                                placeholder="Explain the problem in the image or ask a question..."
                                {...field}
                                disabled={isLoading}
                                />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />
                        <Button type="submit" disabled={isLoading} size="icon">
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                        </Button>
                    </form>
                </Form>
            </div>
        </div>
      </CardContent>
    </Card>
  );
}
