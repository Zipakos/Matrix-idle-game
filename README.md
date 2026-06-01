# Matrix Idle Simulation Engine

   A pure React Native incremental idle game built with a completely decoupled state architecture.

   ## Features
   * **Decoupled Math Engine:** Global production updates seamlessly using static data trees.
   * **Persistent Offline Progress:** Uses `AsyncStorage` to calculate elapsed system time on launch, automatically awarding background production values.
   * **Anti-Freeze Protection:** Local state self-heals if system clocks desynchronize.
