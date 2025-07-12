type LogLevel = "error" | "warn" | "info" | "debug";

// ANSI color codes for terminal formatting
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  dim: "\x1b[2m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",
  bgRed: "\x1b[41m",
  bgGreen: "\x1b[42m",
  bgYellow: "\x1b[43m",
  bgBlue: "\x1b[44m",
};

// Log level configurations with colors and icons
const levelConfig = {
  error: {
    color: colors.red,
    bgColor: colors.bgRed,
    icon: "❌",
    label: "ERROR",
  },
  warn: {
    color: colors.yellow,
    bgColor: colors.bgYellow,
    icon: "⚠️ ",
    label: "WARN ",
  },
  info: {
    color: colors.blue,
    bgColor: colors.bgBlue,
    icon: "📘",
    label: "INFO ",
  },
  debug: {
    color: colors.magenta,
    bgColor: colors.bgBlue,
    icon: "🔍",
    label: "DEBUG",
  },
};

export class Logger {
  private readonly level: LogLevel;

  constructor(level: LogLevel = "info") {
    this.level = level;
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = { error: 0, warn: 1, info: 2, debug: 3 };
    return levels[level] <= levels[this.level];
  }

  private formatTimestamp(): string {
    const now = new Date();
    const date = now.toLocaleDateString();
    const time = now.toLocaleTimeString();
    return `${colors.gray}${date} ${time}${colors.reset}`;
  }

  private formatLevel(level: LogLevel): string {
    const config = levelConfig[level];
    return `${config.color}${config.icon} ${config.label}${colors.reset}`;
  }

  private formatMessage(level: LogLevel, message: string, meta?: any): string {
    const timestamp = this.formatTimestamp();
    const levelStr = this.formatLevel(level);
    const config = levelConfig[level];

    // Format the main message
    const formattedMessage = `${config.color}${message}${colors.reset}`;

    // Format metadata if present
    let metaStr = "";
    if (meta && typeof meta === "object") {
      // Pretty print JSON with indentation and colors
      const jsonStr = JSON.stringify(meta, null, 2);
      metaStr = `\n${colors.gray}${jsonStr}${colors.reset}`;
    } else if (meta) {
      metaStr = ` ${colors.cyan}${meta}${colors.reset}`;
    }

    return `${timestamp} ${levelStr} ${formattedMessage}${metaStr}`;
  }

  private formatTable(data: Record<string, any>): string {
    const entries = Object.entries(data);
    const maxKeyLength = Math.max(...entries.map(([key]) => key.length));

    let table = `\n${colors.gray}┌${"─".repeat(maxKeyLength + 2)}┬${"─".repeat(
      40
    )}┐${colors.reset}\n`;

    entries.forEach(([key, value]) => {
      const paddedKey = key.padEnd(maxKeyLength);
      const valueStr =
        typeof value === "object" ? JSON.stringify(value) : String(value);
      const truncatedValue =
        valueStr.length > 38 ? valueStr.substring(0, 35) + "..." : valueStr;

      table += `${colors.gray}│ ${colors.cyan}${paddedKey}${colors.gray} │ ${
        colors.white
      }${truncatedValue.padEnd(38)}${colors.gray} │${colors.reset}\n`;
    });

    table += `${colors.gray}└${"─".repeat(maxKeyLength + 2)}┴${"─".repeat(
      40
    )}┘${colors.reset}`;
    return table;
  }

  error(message: string, meta?: any): void {
    if (this.shouldLog("error")) {
      console.error(this.formatMessage("error", message, meta));
    }
  }

  warn(message: string, meta?: any): void {
    if (this.shouldLog("warn")) {
      console.warn(this.formatMessage("warn", message, meta));
    }
  }

  info(message: string, meta?: any): void {
    if (this.shouldLog("info")) {
      console.info(this.formatMessage("info", message, meta));
    }
  }

  debug(message: string, meta?: any): void {
    if (this.shouldLog("debug")) {
      console.debug(this.formatMessage("debug", message, meta));
    }
  }

  // Additional utility methods for better logging experience
  success(message: string, meta?: any): void {
    if (this.shouldLog("info")) {
      const timestamp = this.formatTimestamp();
      const successIcon = `${colors.green}✅ SUCCESS${colors.reset}`;
      const formattedMessage = `${colors.green}${message}${colors.reset}`;
      const metaStr = meta
        ? `\n${colors.gray}${JSON.stringify(meta, null, 2)}${colors.reset}`
        : "";
      console.log(`${timestamp} ${successIcon} ${formattedMessage}${metaStr}`);
    }
  }

  table(title: string, data: Record<string, any>): void {
    if (this.shouldLog("info")) {
      const timestamp = this.formatTimestamp();
      const tableIcon = `${colors.blue}📊 TABLE${colors.reset}`;
      const formattedTitle = `${colors.blue}${title}${colors.reset}`;
      const tableStr = this.formatTable(data);
      console.log(`${timestamp} ${tableIcon} ${formattedTitle}${tableStr}`);
    }
  }

  separator(): void {
    if (this.shouldLog("info")) {
      console.log(`${colors.gray}${"─".repeat(80)}${colors.reset}`);
    }
  }

  banner(message: string): void {
    if (this.shouldLog("info")) {
      const border = "█".repeat(message.length + 4);
      console.log(`\n${colors.cyan}${border}`);
      console.log(
        `█ ${colors.bright}${message}${colors.reset}${colors.cyan} █`
      );
      console.log(`${border}${colors.reset}\n`);
    }
  }
}
