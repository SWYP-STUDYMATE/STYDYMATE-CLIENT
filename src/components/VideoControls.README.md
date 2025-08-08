# VideoControls Component

A comprehensive and customizable video call control bar component for React applications. This component provides all essential controls for video conferencing applications with a modern, dark-themed UI.

## Features

- 🎤 **Microphone Toggle** - Mute/unmute with visual state indication
- 📹 **Camera Toggle** - Enable/disable video with visual feedback
- 🖥️ **Screen Sharing** - Start/stop screen sharing functionality
- ✋ **Raise Hand** - Signal to speak or get attention
- 👥 **Participants View** - Show participant count with badge
- 💬 **Chat Integration** - Display unread message count
- 🌐 **Language Selector** - Multi-language support with flag emojis
- ⚙️ **Settings** - Quick access to settings
- 📞 **End Call** - Prominent call termination button
- 📊 **More Options** - Additional features menu (speaker stats, mute all, recording)
- 📱 **Mobile Responsive** - Adapts layout for mobile devices
- 💡 **Tooltips** - Helpful hints on hover
- ♿ **Accessible** - Proper ARIA labels and keyboard navigation

## Installation

```bash
# Make sure you have lucide-react installed
npm install lucide-react
```

## Usage

```jsx
import VideoControls from './components/VideoControls';

function VideoCallScreen() {
  const handleMicToggle = (isOn) => {
    console.log('Microphone:', isOn ? 'ON' : 'OFF');
  };

  const handleCameraToggle = (isOn) => {
    console.log('Camera:', isOn ? 'ON' : 'OFF');
  };

  const handleEndCall = () => {
    console.log('Ending call...');
    // Disconnect from call
  };

  return (
    <VideoControls
      onMicToggle={handleMicToggle}
      onCameraToggle={handleCameraToggle}
      onEndCall={handleEndCall}
      participantCount={5}
      unreadChatCount={3}
    />
  );
}
```

## Props

| Prop                      | Type                           | Default | Description                                  |
| ------------------------- | ------------------------------ | ------- | -------------------------------------------- |
| `onMicToggle`             | `(isOn: boolean) => void`      | -       | Callback when microphone is toggled          |
| `onCameraToggle`          | `(isOn: boolean) => void`      | -       | Callback when camera is toggled              |
| `onEndCall`               | `() => void`                   | -       | Callback when end call is clicked            |
| `onScreenShareToggle`     | `(isSharing: boolean) => void` | -       | Callback when screen share is toggled        |
| `onLanguageChange`        | `(langCode: string) => void`   | -       | Callback when language is changed            |
| `onSettingsClick`         | `() => void`                   | -       | Callback when settings button is clicked     |
| `onParticipantsClick`     | `() => void`                   | -       | Callback when participants button is clicked |
| `onChatClick`             | `() => void`                   | -       | Callback when chat button is clicked         |
| `onRaiseHand`             | `(isRaised: boolean) => void`  | -       | Callback when raise hand is toggled          |
| `onMoreOptionsClick`      | `(action: string) => void`     | -       | Callback for more options menu actions       |
| `initialMicState`         | `boolean`                      | `true`  | Initial microphone state                     |
| `initialCameraState`      | `boolean`                      | `true`  | Initial camera state                         |
| `initialScreenShareState` | `boolean`                      | `false` | Initial screen share state                   |
| `disabled`                | `boolean`                      | `false` | Disable all controls                         |
| `className`               | `string`                       | `""`    | Additional CSS classes                       |
| `showLanguageButton`      | `boolean`                      | `true`  | Show/hide language selector                  |
| `showSettingsButton`      | `boolean`                      | `true`  | Show/hide settings button                    |
| `showParticipantsButton`  | `boolean`                      | `true`  | Show/hide participants button                |
| `showChatButton`          | `boolean`                      | `true`  | Show/hide chat button                        |
| `showRaiseHandButton`     | `boolean`                      | `true`  | Show/hide raise hand button                  |
| `showMoreButton`          | `boolean`                      | `true`  | Show/hide more options button                |
| `currentLanguage`         | `string`                       | `"en"`  | Current selected language code               |
| `participantCount`        | `number`                       | `0`     | Number of participants to display            |
| `unreadChatCount`         | `number`                       | `0`     | Number of unread messages                    |
| `isHandRaised`            | `boolean`                      | `false` | Initial hand raised state                    |
| `isMobile`                | `boolean`                      | `false` | Enable mobile layout                         |

## Supported Languages

The component includes built-in support for:
- 🇺🇸 English (en)
- 🇰🇷 Korean (ko)
- 🇯🇵 Japanese (ja)
- 🇨🇳 Chinese (zh)
- 🇪🇸 Spanish (es)

## Styling

The component uses Tailwind CSS classes for styling. Main color scheme:
- Background: `#1A1A1A` (dark gray)
- Secondary: `#2A2A2A` (medium gray)
- Active/Primary: `#4285F4` (blue)
- Danger/Off state: `#EA4335` (red)
- Text: White

## Mobile Responsiveness

When `isMobile` is set to `true`:
- Controls wrap to multiple lines if needed
- End call button text is hidden to save space
- Dividers between sections are hidden
- Border radius changes from pill to rounded rectangle

## Accessibility

- All buttons include proper `aria-label` attributes
- Keyboard navigation is fully supported
- Visual feedback for all interactive states
- Tooltips provide additional context

## Example with All Features

```jsx
<VideoControls
  // Callbacks
  onMicToggle={(isOn) => console.log('Mic:', isOn)}
  onCameraToggle={(isOn) => console.log('Camera:', isOn)}
  onEndCall={() => console.log('Call ended')}
  onScreenShareToggle={(isSharing) => console.log('Screen share:', isSharing)}
  onLanguageChange={(lang) => console.log('Language:', lang)}
  onSettingsClick={() => console.log('Settings clicked')}
  onParticipantsClick={() => console.log('Participants clicked')}
  onChatClick={() => console.log('Chat clicked')}
  onRaiseHand={(raised) => console.log('Hand raised:', raised)}
  onMoreOptionsClick={(action) => console.log('Action:', action)}
  
  // States
  initialMicState={true}
  initialCameraState={true}
  initialScreenShareState={false}
  currentLanguage="en"
  participantCount={12}
  unreadChatCount={5}
  isHandRaised={false}
  
  // Display options
  showLanguageButton={true}
  showSettingsButton={true}
  showParticipantsButton={true}
  showChatButton={true}
  showRaiseHandButton={true}
  showMoreButton={true}
  
  // Other
  disabled={false}
  isMobile={false}
  className="shadow-lg"
/>
```

## Integration Tips

1. **State Management**: Connect the component to your app's state management (Redux, Zustand, Context API, etc.)
2. **WebRTC Integration**: Wire up the callbacks to your WebRTC implementation
3. **Permissions**: Handle browser permissions for microphone/camera access
4. **Error Handling**: Add error handling for failed media access
5. **Analytics**: Track user interactions through the callbacks

## Browser Compatibility

- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Full support (iOS 14.3+)
- Mobile browsers: Optimized with `isMobile` prop

## License

This component is part of the STUDYMATE-CLIENT project.