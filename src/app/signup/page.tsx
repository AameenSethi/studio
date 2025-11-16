
'use client';

import Link from "next/link"
import { BookOpen, Loader2 } from "lucide-react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
  } from '@/components/ui/form';
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { useUser, type UserProfile } from "@/hooks/use-user-role"


const formSchema = z.object({
    firstName: z.string().min(1, { message: "First name is required." }),
    lastName: z.string().min(1, { message: "Last name is required." }),
    email: z.string().email({ message: "Please enter a valid email." }),
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    captcha: z.string().min(1, { message: "Please enter the text from the image." }),
});

const getMockUserDatabase = () => {
    if (typeof window === 'undefined') {
      return {};
    }
    const storedDb = localStorage.getItem('mockUserDatabase');
    if (storedDb) {
      try {
        return JSON.parse(storedDb);
      } catch (e) {
        return {};
      }
    }
    return {};
};

const saveMockUserDatabase = (db: { [email: string]: UserProfile }) => {
    if (typeof window !== 'undefined') {
        localStorage.setItem('mockUserDatabase', JSON.stringify(db));
    }
};

const generateCaptchaText = (length = 6) => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

export default function SignupPage() {
    const router = useRouter();
    const { toast } = useToast();
    const [isLoading, setIsLoading] = useState(false);
    const { loadUserByEmail } = useUser();
    const [captchaText, setCaptchaText] = useState('');

    useEffect(() => {
        // Generate captcha text on the client-side to avoid hydration mismatch
        setCaptchaText(generateCaptchaText());
    }, []);

    const regenerateCaptcha = () => {
        setCaptchaText(generateCaptchaText());
    }

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            password: "",
            captcha: "",
        },
    });

    function onSubmit(values: z.infer<typeof formSchema>) {
        // Human verification check
        if (values.captcha.toLowerCase() !== captchaText.toLowerCase()) {
            form.setError("captcha", {
                type: "manual",
                message: "Incorrect CAPTCHA. Please try again.",
            });
            regenerateCaptcha();
            return;
        }

        setIsLoading(true);
        
        const db = getMockUserDatabase();
        if (db[values.email.toLowerCase()]) {
            toast({
                variant: 'destructive',
                title: 'User Already Exists',
                description: 'An account with this email already exists. Please sign in.',
            });
            setIsLoading(false);
            regenerateCaptcha();
            return;
        }

        setTimeout(() => {
            const userId = values.email.toLowerCase().replace(/[^a-z0-9]/g, '-');
            const newUser: UserProfile = {
                name: `${values.firstName} ${values.lastName}`,
                email: values.email.toLowerCase(),
                id: userId,
                avatar: `https://i.pravatar.cc/150?u=${userId}`,
                role: 'Student',
                class: '10th Grade',
                field: '',
                institution: '',
            };

            db[newUser.email] = newUser;
            saveMockUserDatabase(db);
            
            // Load the newly created user into the context
            loadUserByEmail(newUser.email);

            toast({
                title: "Account Created!",
                description: "Welcome to StudyPal. You're being redirected to your dashboard.",
            });

            router.push('/dashboard');
            setIsLoading(false);
        }, 1000);
    }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm">
        <CardHeader>
           <div className="flex items-center justify-center gap-2 mb-4">
              <BookOpen className="h-8 w-8 text-primary" />
              <h1 className="text-3xl font-bold text-primary font-headline">
                StudyPal
              </h1>
            </div>
          <CardTitle className="text-2xl">Sign Up</CardTitle>
          <CardDescription>
            Enter your information to create an account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="grid gap-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>First name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Max" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Last name</FormLabel>
                                <FormControl>
                                    <Input placeholder="Robinson" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                 <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input placeholder="m@example.com" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                                <Input type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    )}
                />
                 <div className="space-y-2">
                    <FormLabel htmlFor="captcha">Human Verification</FormLabel>
                    <div className="flex items-center justify-between gap-2 p-2 rounded-md border bg-muted select-none">
                        <div className="font-mono text-2xl tracking-widest flex-grow text-center" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'100\' height=\'40\' viewBox=\'0 0 100 40\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 10 Q 50 30 90 10\' stroke=\'rgba(0,0,0,0.1)\' fill=\'none\' stroke-width=\'1\'/%3E%3Cpath d=\'M10 30 Q 50 10 90 30\' stroke=\'rgba(0,0,0,0.1)\' fill=\'none\' stroke-width=\'1\'/%3E%3C/svg%3E")' }}>
                            {captchaText.split('').map((char, index) => {
                                const colors = ['#f87171', '#60a5fa', '#34d399', '#fbbF24', '#c084fc'];
                                const rotation = Math.random() * 20 - 10;
                                const color = colors[Math.floor(Math.random() * colors.length)];
                                return (
                                    <span key={index} style={{ transform: `rotate(${rotation}deg)`, color, display: 'inline-block' }}>
                                        {char}
                                    </span>
                                );
                            })}
                        </div>
                        <Button type="button" variant="ghost" size="sm" onClick={regenerateCaptcha}>
                            &#x21bb;
                        </Button>
                    </div>
                    <FormField
                        control={form.control}
                        name="captcha"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                    <Input placeholder="Enter the text above" {...field} id="captcha" autoComplete="off" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create an account
                </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Already have an account?{" "}
            <Link href="/" className="underline text-primary">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
