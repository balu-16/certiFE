import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Phone, Shield, Award } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { AppConfig } from '@/config/app.config';

export default function Login() {
  const [step, setStep] = useState<'role' | 'phone' | 'otp'>('role');
  const [role, setRole] = useState<'user' | 'admin'>('user');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { login } = useAuth();

  const handleSendOTP = async () => {
    if (!phone || phone.length < 10) {
      toast({
        title: "Invalid Phone Number",
        description: "Please enter a valid 10-digit phone number",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${AppConfig.api.baseUrl}/v1/auth/send-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phone,
          role: role
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        toast({
          title: "OTP Sent",
          description: "Please check your phone for the verification code",
        });
        setStep('otp');
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to send OTP. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Send OTP error:', error);
      toast({
        title: "Error",
        description: "Failed to send OTP. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      toast({
        title: "Invalid OTP",
        description: "Please enter a valid 6-digit OTP",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${AppConfig.api.baseUrl}/v1/auth/verify-otp`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phoneNumber: phone,
          otp: otp,
          role: role
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const token = data.token || `auth-token-${role}-${Date.now()}`;
        const userRole = role === 'user' ? 'student' : role;
        
        // Store additional user data in localStorage
        localStorage.setItem('userId', data.userId || '');
        localStorage.setItem('userName', data.userName || '');
        
        // Use AuthContext login method to update authentication state
        login(token, userRole, phone);
        
        toast({
          title: "Login Successful",
          description: `Welcome to NIGHA TECH ${role === 'admin' ? 'Admin' : 'Student'} Portal`,
        });

        // Redirect to appropriate dashboard
        if (role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/user/dashboard');
        }
      } else {
        toast({
          title: "Error",
          description: data.message || "Invalid OTP. Please try again.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Verify OTP error:', error);
      toast({
        title: "Error",
        description: "Failed to verify OTP. Please check your connection and try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background">
      {/* Background Pattern */}
      <div 
        className="fixed inset-0 opacity-5 pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='150' xmlns='http://www.w3.org/2000/svg'%3E%3Crect width='160' height='120' x='20' y='15' fill='none' stroke='%230B5F7C' stroke-width='2'/%3E%3Cpath d='M40 35h80M40 50h80M40 65h80M40 80h40' stroke='%230B5F7C' stroke-width='1'/%3E%3Ccircle cx='160' cy='35' r='8' fill='none' stroke='%230B5F7C' stroke-width='1'/%3E%3C/svg%3E")`,
          backgroundSize: '300px 225px',
          backgroundPosition: 'center center',
          backgroundRepeat: 'repeat'
        }}
      />

      <Card className="w-full max-w-md shadow-teal border-primary/20 relative z-10">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 rounded-2xl flex items-center justify-center shadow-golden overflow-hidden">
            <img 
              src="/logo.jpg" 
              alt="NIGHA TECH Logo" 
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold text-primary">NIGHA TECH</CardTitle>
            <CardDescription className="text-muted-foreground">
              Internship Certificate Portal
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 'role' && (
            <div className="space-y-4">
              <Label className="text-base font-medium text-foreground">Select Your Role</Label>
              <RadioGroup value={role} onValueChange={(value) => setRole(value as 'user' | 'admin')}>
                <div className="flex items-center space-x-3 p-4 border border-primary/20 rounded-lg hover:bg-accent/5 transition-colors">
                  <RadioGroupItem value="user" id="user" />
                  <Label htmlFor="user" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Award className="w-5 h-5 text-highlight" />
                    <div>
                      <div className="font-medium">Student</div>
                      <div className="text-sm text-muted-foreground">View and download your certificates</div>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border border-primary/20 rounded-lg hover:bg-accent/5 transition-colors">
                  <RadioGroupItem value="admin" id="admin" />
                  <Label htmlFor="admin" className="flex items-center gap-3 cursor-pointer flex-1">
                    <Shield className="w-5 h-5 text-highlight" />
                    <div>
                      <div className="font-medium">Admin</div>
                      <div className="text-sm text-muted-foreground">Manage certificates and students</div>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
              <Button 
                onClick={() => setStep('phone')} 
                className="w-full" 
                size="lg"
                variant="golden"
              >
                Continue
              </Button>
            </div>
          )}

          {step === 'phone' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="text-base font-medium">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="Enter your registered phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="pl-10 border-primary/20 focus:border-primary"
                  />
                </div>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('role')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleSendOTP} 
                  disabled={loading}
                  className="flex-1"
                  variant="golden"
                >
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </div>
            </div>
          )}

          {step === 'otp' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="otp" className="text-base font-medium">Verification Code</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter the 6-digit OTP sent to your phone"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  className="text-center text-2xl font-mono border-primary/20 focus:border-primary"
                />
                <p className="text-sm text-muted-foreground text-center">
                  OTP sent to {phone}
                </p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => setStep('phone')}
                  className="flex-1"
                >
                  Back
                </Button>
                <Button 
                  onClick={handleVerifyOTP} 
                  disabled={loading}
                  className="flex-1"
                  variant="golden"
                >
                  {loading ? 'Verifying...' : 'Verify OTP'}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}