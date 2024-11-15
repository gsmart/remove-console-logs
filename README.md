
# `remove-console-logs`

## Overview

`remove-console-logs` is a CLI tool to easily remove all console statements (e.g., `console.log`, `console.error`, `console.warn`) from JavaScript and TypeScript files in a specified directory. This tool is helpful for cleaning up your codebase before production deployment or for any project that requires the removal of console statements for any other reason.

## What's New in Version 1.1.1

- **New verbose flag added** for detailed analysis of operations, showing the list of modified files and the number of removed console statements.
- **New about flag added** to display meta-information about the tool, such as version, author, and license.
- **Overall stability improvements** to enhance user experience.

## Prerequisites

- **Node.js**: v14.0.0 or higher
- **npm**: v6.0.0 or higher

Make sure that you have Node.js and npm installed on your machine before installing this package. You can check your versions by running:

```bash
node -v
npm -v
```

If you need to install Node.js and npm, you can download and install it from [nodejs.org](https://nodejs.org/).

## Installation

### Using npm

```bash
npm install -g remove-console-logs-gracefully
```

### Using yarn

```bash
yarn global add remove-console-logs-gracefully
```

## Usage

Navigate to the root of your project directory and run:

```bash
remove-console-logs
```

This will remove all `console` statements from the supported files in the current directory and its subdirectories.

### Options

- **--target=all**: Removes all console statements (e.g., `console.log`, `console.error`, etc.).
- **--no-save**: Displays the changes that would be made without actually modifying the files.
- **--verbose**: Displays detailed output of files modified and the number of console statements removed in a tabular format.
- **--about**: Displays meta-information about the tool, such as version, author, and license.
- **--help**: Displays available commands and their descriptions.

### Examples

- Remove all `console.log` statements (default behavior):

  ```bash
  remove-console-logs
  ```

- Remove all console statements (log, error, warn, etc.):

  ```bash
  remove-console-logs --target=all
  ```

- Preview changes without saving:

  ```bash
  remove-console-logs --no-save
  ```

- Display verbose output of modified files:

  ```bash
  remove-console-logs --verbose
  ```

- Display tool meta-information:

  ```bash
  remove-console-logs --about
  ```

## Platform-Specific Instructions

### Linux / Unix-like (MacOS, FreeBSD)

1. Open your terminal.
2. Install the package globally using npm or yarn (see installation steps above).
3. Navigate to your project directory.
4. Run `remove-console-logs` with the desired options.

### Windows

1. Open your Command Prompt (cmd) or PowerShell as an Administrator.
2. Install the package globally using npm or yarn (see installation steps above).
3. Navigate to your project directory.
4. Run `remove-console-logs` with the desired options.

## Contributing

Contributions, issues, and feature requests are welcome! Feel free to check out the [issues page](https://github.com/yourusername/remove-console-logs/issues).

## Author

**Ganesh Sawant**

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
