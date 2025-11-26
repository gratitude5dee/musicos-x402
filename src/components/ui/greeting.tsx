import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const Greeting = () => {
  const { user } = useAuth();
  const [greeting, setGreeting] = useState("");
  const [timePhrase, setTimePhrase] = useState("");
  const [profileName, setProfileName] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchProfileName = async () => {
      if (!user?.id) {
        if (isMounted) setProfileName(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('username')
        .eq('id', user.id)
        .maybeSingle();

      if (!isMounted) return;

      if (error) {
        setProfileName(null);
        return;
      }

      setProfileName(data?.username ?? null);
    };

    fetchProfileName();

    return () => {
      isMounted = false;
    };
  }, [user?.id]);
  
  useEffect(() => {
    const getGreeting = () => {
      const hour = new Date().getHours();
      
      if (hour >= 5 && hour < 12) {
        setGreeting("Good morning");
      } else if (hour >= 12 && hour < 17) {
        setGreeting("Good afternoon");
      } else if (hour >= 17 && hour < 21) {
        setGreeting("Good evening");
      } else {
        setGreeting("Good night");
      }
    };
    
    const getTimePhrase = () => {
      const phrases = [
        "Your creative energy is peaking",
        "Ready for another inspired day",
        "Time to bring your ideas to life",
        "Your gallery is growing beautifully"
      ];
      
      setTimePhrase(phrases[Math.floor(Math.random() * phrases.length)]);
    };
    
    getGreeting();
    getTimePhrase();
    
    const intervalId = setInterval(getGreeting, 60000); // Update greeting every minute
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Get user's name from profile or email
  const getUserName = () => {
    if (profileName) {
      return profileName;
    }
    if (user?.display_name) {
      return user.display_name.split(' ')[0];
    }
    if (user?.username) {
      return user.username;
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return "Artist";
  };
  return (
    <div>
      <motion.h1 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="text-xl md:text-2xl font-medium text-balance mb-1"
      >
        {greeting}, <span className="text-studio-accent">{getUserName()}</span>
      </motion.h1>
      <motion.p 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="text-sm text-muted-foreground"
      >
        {timePhrase}
      </motion.p>
    </div>
  );
};

export default Greeting;
