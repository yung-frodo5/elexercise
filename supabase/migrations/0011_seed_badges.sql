-- Initial badge catalog. `criteria` is descriptive text, not a machine-
-- evaluated rule (see 0005's comment: badges are schema/catalog only --
-- there's no earning logic yet), so several of these reference data this
-- schema doesn't track yet (referrals, groups, leaderboard history, grid
-- outage status, a calibration/setup flow) -- fine for now, awarding logic
-- is a separate, later decision.
insert into public.badges (name, tagline, category, criteria, emoji) values
  ('First Watt', 'Watt''s The Big Idea?', 'Milestones', 'Complete your very first workout', '⚡'),
  ('Plugged In', null, 'Milestones', 'Reach Tier 5 (Static)', '🔌'),
  ('Grid Connected', null, 'Milestones', 'Reach Tier 15 (Powerhouse)', '🌐'),
  ('Off the Grid', null, 'Milestones', 'Reach Tier 30 (Net-Zero Legend)', '👑'),
  ('Fully Assembled', null, 'Milestones', 'Complete platform setup + first calibration', '🛠️'),
  ('Battery Bonded', null, 'Milestones', 'Charge your battery bank to 100% for the first time', '🔋'),

  ('Spark Streak', 'Consistent Power', 'Consistency/Streaks', '3 workouts in 3 consecutive days', '🔥'),
  ('Steady Current', null, 'Consistency/Streaks', '7-day workout streak', '🌊'),
  ('Unbroken Circuit', 'Short Circuit', 'Consistency/Streaks', '30-day workout streak', '🔁'),
  ('Full Charge', null, 'Consistency/Streaks', '100-day workout streak', '💯'),
  ('Weekend Warrior', null, 'Consistency/Streaks', 'Work out both Sat & Sun, 4 weekends in a row', '🛡️'),

  ('Overdrive', null, 'Performance', 'Perform a max power set for the first time', '🚀'),
  ('Century Session', null, 'Performance', 'Generate 1+ kWh in a single workout', '🎯'),
  ('You Put The Our In Hour', null, 'Performance', 'Single session lasting 60+ minutes', '⏱️'),
  ('Killawatt? Why? What Did It Do To Me?', null, 'Performance', 'Reach 1 kW of instantaneous power', '💀'),

  ('Recruiter', null, 'Social/Community', 'Refer your first friend to the platform', '🤝'),
  ('Power Squad', null, 'Social/Community', 'Create a group with at least 4 members', '👥'),
  ('Top of the Grid', null, 'Social/Community', 'Reach #1 on any leaderboard', '🏆'),
  ('Podium Finish', null, 'Social/Community', 'Place top 3 on a leaderboard for the first time', '🏅'),
  ('Community Watt', 'Stronger Together', 'Social/Community', 'Participate in your first group/community challenge', '🌟'),

  ('Early Bird Volt', 'Early Bird Gets The Volt', 'Fun/Quirky', 'Complete a workout before 6 AM', '🌅'),
  ('Night Owl Amp', 'Night Owl Gets Amped Up', 'Fun/Quirky', 'Complete a workout after 11 PM', '🦉'),
  ('New Year, New Watts', 'New Year Who Dis', 'Fun/Quirky', 'Work out on Jan 1st', '🎉'),
  ('Leap Second', 'Leap Into The Future', 'Fun/Quirky', 'Work out on Feb 29th (leap year Easter egg)', '🐸'),
  ('Storm Chaser', null, 'Fun/Quirky', 'Complete a workout during a tracked storm/power outage (if grid-status data available)', '⛈️'),
  ('Anniversary Amp', 'Ampiversary', 'Fun/Quirky', 'Work out on your platform sign-up anniversary', '🎂');
