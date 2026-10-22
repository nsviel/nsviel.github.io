// Chance that any generated line is an easter egg.
// 0.0075 = 0.75% (about 1 line out of 133).
// Use 0.05 for a more visible effect, or 1 while testing this file.
var TerminalEasterEggProbability = 0.25;

// Add, remove, or edit easter eggs in this list.
// Each entry must keep the three fields: source, event, and value.
var TerminalEasterEggs = [
  { source: "cluster", event: "mood", value: "optimistic" },
  { source: "database", event: "status", value: "probably fine" },
  { source: "prediction", event: "confidence", value: "147.3 %" },
  { source: "intern_01", event: "coffee", value: "CRITICAL" },
  { source: "backup", event: "status", value: "scheduled_since_2022" },
  { source: "dataset", event: "size", value: "yes" },

  { source: "model_07", event: "accuracy", value: "100.00 % suspicious" },
  { source: "model_08", event: "accuracy", value: "0.00 % honest" },
  { source: "training", event: "loss", value: "NaN but decreasing" },
  { source: "optimizer", event: "status", value: "doing its best" },
  { source: "gradient", event: "norm", value: "∞" },
  { source: "gpu_0", event: "temperature", value: "please stop" },
  { source: "gpu_1", event: "memory", value: "15.99 / 16.00 GB" },

  // Professor
  { source: "professor", event: "coffee", value: "CRITICAL" },
  { source: "professor", event: "slides_remaining", value: "87" },
  { source: "professor", event: "slides_added_today", value: "34" },
  { source: "professor", event: "estimated_duration", value: "2h00 allegedly" },
  { source: "professor", event: "confidence", value: "51.2 %" },
  { source: "professor", event: "deadline", value: "also_tomorrow" },
  { source: "professor", event: "free_time", value: "NULL" },
  { source: "professor", event: "email_unread", value: "429 TOO MANY REQUESTS" },
  { source: "professor", event: "meeting", value: "could_have_been_an_email" },
  { source: "professor", event: "grading_progress", value: "3 / 47" },
  { source: "professor", event: "grading_motivation", value: "NaN" },
  { source: "professor", event: "course_status", value: "almost_finished_v7" },
  { source: "professor", event: "new_idea", value: "please_no" },
  { source: "professor", event: "weekend", value: "NOT_FOUND" },
  { source: "professor", event: "latex_error", value: "line 1" },
  { source: "professor", event: "demo", value: "worked_yesterday" },

  // Students
  { source: "student_001", event: "project_started", value: "false" },
  { source: "student_007", event: "README", value: "coming_soon" },
  { source: "student_012", event: "deadline", value: "tomorrow apparently" },
  { source: "student_017", event: "commit", value: "final" },
  { source: "student_018", event: "commit", value: "final_v2" },
  { source: "student_019", event: "commit", value: "final_v2_REAL" },
  { source: "student_021", event: "training_time", value: "47 hours" },
  { source: "student_021", event: "saved_weights", value: "false" },
  { source: "student_024", event: "accuracy", value: "100.0 % definitely fine" },
  { source: "student_027", event: "loss", value: "NaN" },
  { source: "student_027", event: "solution", value: "increase_epochs" },
  { source: "student_031", event: "bug", value: "probably_pytorch" },
  { source: "student_034", event: "documentation", value: "optional?" },
  { source: "student_038", event: "git_push", value: "23:59:58" },
  { source: "student_042", event: "question", value: "is_this_graded?" },
  { source: "student_043", event: "question", value: "will_this_be_on_the_exam?" },
  { source: "student_047", event: "baseline", value: "better_than_model" },
  { source: "student_051", event: "gpu", value: "OOM" },
  { source: "student_051", event: "batch_size", value: "DOUBLE_IT" },
  { source: "student_058", event: "code", value: "works_on_my_machine" },
  { source: "student_063", event: "random_seed", value: "what_seed?" },
  { source: "student_069", event: "hyperparameters", value: "vibes" },
  { source: "student_073", event: "experiment", value: "n=1" },
  { source: "student_077", event: "presentation", value: "final_final.pptx" },
  { source: "student_081", event: "repository", value: "private" },
  { source: "student_404", event: "attendance", value: "NOT_FOUND" },

  { source: "production", event: "test", value: "passed_locally" },
  { source: "server_404", event: "status", value: "200 OK" },
  { source: "localhost", event: "works", value: "true" },
  { source: "documentation", event: "last_seen", value: "2019" },
  { source: "dependency", event: "version", value: "latest-ish" },
  { source: "pipeline", event: "status", value: "DO_NOT_TOUCH" },

  { source: "query_1337", event: "SELECT", value: "* FROM everything" },
  { source: "table_users", event: "rows", value: "18446744073709551616" },
  { source: "data_lake", event: "status", value: "becoming_data_swamp" },
  { source: "null", event: "value", value: "null" },

  { source: "tinyworld", event: "agent", value: "still_alive_somehow" },
  { source: "planet", event: "hop", value: "true" },

  { source: "system", event: "meaning_of_life", value: "42" },
  { source: "simulation", event: "reality", value: "deprecated" },
  { source: "universe", event: "entropy", value: "increasing_as_expected" }
];
