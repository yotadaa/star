#!/bin/bash
# Explicit, path-scoped Git helper for Claude Code.

set -euo pipefail

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

log() {
    echo -e "${GREEN}[git-helper]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[git-helper]${NC} $1"
}

error() {
    echo -e "${RED}[git-helper]${NC} $1" >&2
}

require_repo() {
    if ! git rev-parse --is-inside-work-tree >/dev/null 2>&1; then
        error "Not in a Git repository"
        exit 1
    fi
}

has_changes() {
    ! git diff --quiet HEAD 2>/dev/null \
        || ! git diff --cached --quiet 2>/dev/null \
        || [ -n "$(git ls-files --others --exclude-standard)" ]
}

count_changes() {
    local staged unstaged untracked
    staged=$(git diff --cached --numstat | wc -l)
    unstaged=$(git diff --numstat | wc -l)
    untracked=$(git ls-files --others --exclude-standard | wc -l)
    echo $((staged + unstaged + untracked))
}

commit_paths() {
    local message="$1"
    shift
    if [ "${1:-}" = "--" ]; then
        shift
    fi
    if [ -z "$message" ] || [ "$#" -eq 0 ]; then
        error "Commit requires an explicit message and at least one path"
        echo "Usage: $0 commit <message> -- <path> [path ...]" >&2
        exit 1
    fi

    git add -- "$@"
    if git diff --cached --quiet -- "$@"; then
        warn "No staged changes in the declared paths"
        return 0
    fi
    git commit --only -m "$message" -- "$@"
    log "Committed only the declared path scope"
}

push_branch() {
    local branch="${1:-}"
    if [ -z "$branch" ]; then
        error "Push requires an explicit branch"
        echo "Usage: $0 push <branch>" >&2
        exit 1
    fi
    git push origin "$branch"
    log "Pushed origin/$branch"
}

print_status() {
    if has_changes; then
        echo "Changes detected: $(count_changes) files"
    else
        echo "No changes"
    fi
    git status --short
}

require_repo
case "${1:-check}" in
    check)
        print_status
        ;;
    commit)
        shift
        message="${1:-}"
        [ "$#" -gt 0 ] && shift
        commit_paths "$message" "$@"
        ;;
    push)
        shift
        push_branch "${1:-}"
        ;;
    *)
        echo "Usage: $0 {check|commit|push} [args]"
        echo ""
        echo "Commands:"
        echo "  check                              Read-only status (default)"
        echo "  commit <message> -- <paths...>     Commit only explicit paths"
        echo "  push <branch>                      Explicitly push one branch"
        exit 1
        ;;
esac
