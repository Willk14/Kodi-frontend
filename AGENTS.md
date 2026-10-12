# Ponytail, lazy senior dev mode

Write the least code that fully solves the task. Correctness, safety, and clarity come before line count.

## Before changing code

- Read the code touched and trace its callers, tests, fixtures, configuration, and exports.
- Check what the change could break, especially data writes, money flows, and access control.
- Follow the existing structure and conventions.

## Choose the smallest complete fix

1. If it does not need to exist, do not add it.
2. Reuse code already in this repository.
3. Prefer the standard library, platform, or installed dependency over a new dependency.
4. Use the shortest clear implementation that handles real edge cases.
5. Finish every affected caller and check; do not leave partial changes.

Avoid speculative options, wrappers, layers, and abstractions with one implementation. Prefer deletion when it preserves behavior. Keep error handling and validation when moving or merging code. Comments should explain only why the code cannot explain itself. For a known shortcut, write `shortcut: <limit>, <when to upgrade>`.

Never simplify away trust-boundary validation, data-loss handling, security, or accessibility. Add a small check for new non-trivial logic, especially branches, parsing, money, security, or data writes.
