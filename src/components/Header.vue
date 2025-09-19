<template>
  <header class="topbar" role="banner">
    <div class="topbar-left">
      <h1 class="page-title">Calendar</h1>
    </div>

    <div class="topbar-actions" role="group" aria-label="Header actions">
      <button class="icon-btn" title="Language">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15 15 0 0 0 0 20M12 2a15 15 0 0 1 0 20" />
        </svg>
      </button>

      <button class="icon-btn" title="Messages">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      <button class="icon-btn" title="Notifications">
        <svg
          viewBox="0 0 24 24"
          width="18"
          height="18"
          fill="none"
          stroke="currentColor"
          stroke-width="1.6"
        >
          <path d="M18 8a6 6 0 0 0-12 0c0 7-3 8-3 8h18s-3-1-3-8" />
        </svg>
      </button>

      <div class="profile">
        <div class="profile-name">John Doe</div>
        <div class="avatar" aria-hidden="true">JD</div>
      </div>
    </div>
  </header>
</template>

<style lang="scss" scoped>
$topbar-height: 64px;
$topbar-bg: #fff;
$topbar-border: #eceaf0;

.topbar {
  height: $topbar-height;
  background: $topbar-bg;
  border-bottom: 1px solid $topbar-border;
  display: flex;
  align-items: center;
  padding: 0 20px;
  gap: 20px;
  z-index: 2;
  justify-content: space-between;

  &:focus {
    outline: none;
  }

  .topbar-left {
    min-width: 220px;
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .page-title {
    font-size: 18px;
    font-weight: 600;
    color: #34343a;
    margin: 0;
  }

  .search {
    flex: 1;
    max-width: 760px;
    display: flex;
    align-items: center;
    gap: 10px;
    background: #f7f7fb;
    border-radius: 8px;
    padding: 8px 12px;

    .search-icon {
      color: #9aa0a6;
      flex: 0 0 18px;
    }

    input[type='search'] {
      background: transparent;
      border: none;
      outline: none;
      font-size: 14px;
      color: #333;
      width: 100%;
      padding: 6px 0;
    }
  }

  .topbar-actions {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-left: 8px;
  }

  .icon-btn {
    background: transparent;
    border: none;
    padding: 8px;
    border-radius: 8px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #6b6f76;
    cursor: pointer;

    &:hover {
      background: rgba(0, 0, 0, 0.03);
      color: #333;
    }
  }

  .profile {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-left: 8px;

    .profile-name {
      font-size: 14px;
      color: #333;
      display: none;
    }

    .avatar {
      background: linear-gradient(180deg, #f1f3f6, #dfe3e8);
      color: #333;
      width: 36px;
      height: 36px;
      border-radius: 999px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 600;
      font-size: 13px;
      box-shadow: 0 1px 0 rgba(0, 0, 0, 0.04) inset;
    }
  }

  @media (min-width: 980px) {
    .profile .profile-name {
      display: block;
    }
  }
}
</style>
