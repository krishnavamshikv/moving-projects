# 🚀 30-Day Accelerated DevOps Web Tracker & Task Studio

A modern, fullstack web application designed to accelerate the 90 Days of DevOps curriculum into a high-velocity **30-Day Accelerated Learning Track**. Built with React, Vite, Express, and SQLite.

![DevOps Tracker Banner](src/assets/hero.png)

---

## ✨ Features

* **⚡ Dynamic Velocity Engine**: Calculates your real-time completion velocity (baseline 3.0 tasks/day). If you complete 4–5 tasks per day, the engine recalculates your pace and dynamically reduces your target finish date (e.g. `-5 Days Saved!`).
* **💾 Persistent SQLite Database**: Progress and completion timestamps are stored directly on disk inside `tracker/server/tracker.db`.
* **📝 Split-View Task Editor Studio**:
  * **Left Side**: Full Task Definition (Today's Goal, Expected Output, Guidelines, Why This Matters for DevOps).
  * **Right Side**: Markdown Text Editor with line counters + rendered Markdown Preview mode.
  * Direct file creation for required day deliverables (e.g. `learning-plan.md`, `linux-architecture-notes.md`, `linux-commands-cheatsheet.md`, `linux-practice.md`).
* **🎛️ Horizontal Topic Filters**: Easily filter tasks by module (*Linux Fundamentals*, *Networking*, *Shell Scripting*, *Docker*, *Kubernetes*, *Terraform*, *Ansible*, *Observability*, etc.) with scroll controls.
* **🌐 Universal Portable CLI (`start-tracker`)**: Launch the tracker from any terminal location or directory on your system.

---

## 🏗️ Architecture

```
90DaysOfDevOps/
├── 2026/                       # 90 Original Daily DevOps READMEs & Solution Files
│   ├── day-01/                 # README.md & learning-plan.md
│   ├── day-02/                 # README.md & linux-architecture-notes.md
│   └── ...
├── scripts/
│   └── generate-tasks-data.js  # Dataset generator parsing 2026/ READMEs into tasksData.json
└── tracker/                    # Web Application
    ├── server/                 # Express API + SQLite Database
    │   ├── index.js            # Express server (Port 3001) & static file provider for 2026/
    │   └── tracker.db          # SQLite Database
    ├── src/
    │   ├── App.jsx             # Main Dashboard & Velocity Card
    │   ├── components/
    │   │   ├── TaskModal.jsx        # Task Instructions Modal
    │   │   └── TaskEditorStudio.jsx # Split-View Markdown Text Editor Studio
    │   └── utils/
    │       └── velocityEngine.js    # Velocity calculation algorithms
    └── vite.config.js          # Vite config (Port 5173 with Express Proxy)
```

---

## 📦 Prerequisites

Before installing, ensure you have the following installed on your system:
* **Node.js**: `v18.0.0` or higher (Recommended: Node `v24.19.0` LTS)
* **npm**: `v9.0.0` or higher
* **Git**: for cloning and version control

---

## 🚀 Setup & Installation Guide (Any Folder / Any Machine)

You can clone the project into **any folder on your machine** (e.g. `~/Projects/90DaysOfDevOps`, `~/Desktop/90DaysOfDevOps`, or `~/workspace/90DaysOfDevOps`):

### 1. Clone the Repository
```bash
git clone https://github.com/krishnavamshikv/accelerated-30DaysOfDevOps.git 90DaysOfDevOps
cd 90DaysOfDevOps
```

### 2. Install Tracker Dependencies
Navigate to the `tracker/` directory and install npm packages:

```bash
cd tracker
npm install
```

### 3. Start the Application
Run the fullstack development server (Express SQLite API on port `3001` + Vite React on port `5173` concurrently):

```bash
npm start
```

Open your browser and navigate to:
👉 **`http://localhost:5173/`**

---

## ⚡ Optional: Install Portable Global Command (`start-tracker`)

To launch the tracker from **any terminal location** on your machine regardless of where you cloned it, install the smart auto-detecting executable script:

### Step 1: Create Executable Script
Create `~/.local/bin/start-tracker`:

```bash
mkdir -p "$HOME/.local/bin"

cat << 'EOF' > "$HOME/.local/bin/start-tracker"
#!/usr/bin/env bash

# Load NVM Node environment if available
if [ -s "$HOME/.nvm/nvm.sh" ]; then
  export NVM_DIR="$HOME/.nvm"
  \. "$NVM_DIR/nvm.sh"
fi

# Multi-location dynamic directory detection
if [ -d "./tracker" ] && [ -f "./tracker/package.json" ]; then
  TRACKER_DIR="$(pwd)/tracker"
elif [ -f "./package.json" ] && [ -f "./server/index.js" ]; then
  TRACKER_DIR="$(pwd)"
elif [ -n "$TRACKER_DIR" ] && [ -d "$TRACKER_DIR" ]; then
  TRACKER_DIR="$TRACKER_DIR"
else
  CANDIDATES=(
    "$HOME/workspace/90DaysOfDevOps/tracker"
    "$HOME/90DaysOfDevOps/tracker"
    "$HOME/Projects/90DaysOfDevOps/tracker"
    "$HOME/Desktop/90DaysOfDevOps/tracker"
    "$HOME/code/90DaysOfDevOps/tracker"
    "$HOME/src/90DaysOfDevOps/tracker"
  )

  FOUND=""
  for candidate in "${CANDIDATES[@]}"; do
    if [ -d "$candidate" ]; then
      FOUND="$candidate"
      break
    fi
  done

  if [ -n "$FOUND" ]; then
    TRACKER_DIR="$FOUND"
  else
    echo "❌ Error: Tracker directory not found!"
    echo "Please navigate into your 90DaysOfDevOps project folder and run 'start-tracker'."
    exit 1
  fi
fi

echo "🚀 Starting DevOps 30-Day Tracker from $TRACKER_DIR..."
cd "$TRACKER_DIR" || exit 1
exec npm start
EOF

chmod +x "$HOME/.local/bin/start-tracker"
```

### Step 2: Add `~/.local/bin` to your Shell PATH
Add the binary path to your shell configuration (`~/.bashrc`, `~/.zshrc`, or `~/.profile`):

```bash
echo 'export PATH="$HOME/.local/bin:$PATH"' >> ~/.bashrc
source ~/.bashrc
```

Now anyone can type `start-tracker` from inside their repo directory or anywhere in their shell:

```bash
start-tracker
```

---

## 🛠️ Development Scripts

Inside the `tracker/` directory:

| Command | Description |
| :--- | :--- |
| `npm start` | Runs Express server (`node server/index.js`) and Vite React server concurrently |
| `npm run dev` | Runs Vite React frontend server alone |
| `npm run build` | Builds production distribution in `dist/` |
| `node ../scripts/generate-tasks-data.js` | Regenerates `tasksData.json` from `2026/` README files |

---

## 📜 License
Open-source under the MIT License.
