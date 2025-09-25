# SehatSetu Video Call System

A P2P video call application built with WebRTC and Socket.IO for telemedicine consultations.

## Features

- **P2P Video Calls**: Direct peer-to-peer connections for low latency
- **Room Management**: Create and join video call rooms with unique IDs
- **Reference Links**: Generate shareable links for both host and guest participants
- **Real-time Signaling**: WebRTC signaling through Socket.IO
- **Call Controls**: Mute/unmute audio, turn video on/off
- **Responsive UI**: Modern, mobile-friendly interface

## API Endpoints

### Create Video Call Room
```
POST /api/video-call/create
Content-Type: application/json

{
  "hostId": "user123",
  "hostName": "Dr. Smith"
}
```

**Response:**
```json
{
  "success": true,
  "roomId": "uuid-room-id",
  "hostLink": "http://localhost:3001/video-call/uuid-room-id?role=host&id=user123&name=Dr.%20Smith",
  "guestLink": "http://localhost:3001/video-call/uuid-room-id?role=guest",
  "room": {
    "id": "uuid-room-id",
    "status": "waiting",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Join Video Call Room
```
POST /api/video-call/join
Content-Type: application/json

{
  "roomId": "uuid-room-id",
  "participantId": "user456",
  "participantName": "Patient Name"
}
```

### Get Room Information
```
GET /api/video-call/room/:roomId
```

## Socket.IO Events

### Client to Server Events

- `join-room`: Join a video call room
- `offer`: Send WebRTC offer
- `answer`: Send WebRTC answer
- `ice-candidate`: Send ICE candidate
- `toggle-mute`: Toggle audio mute
- `toggle-video`: Toggle video on/off
- `end-call`: End the video call

### Server to Client Events

- `room-joined`: Successfully joined room
- `user-joined`: Another user joined
- `user-left`: User left the room
- `offer`: Receive WebRTC offer
- `answer`: Receive WebRTC answer
- `ice-candidate`: Receive ICE candidate
- `user-muted`: User muted/unmuted
- `user-video-toggled`: User toggled video
- `call-ended`: Call was ended
- `error`: Error occurred

## Usage

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Server
```bash
npm start
```

### 3. Access the Demo
Open your browser and navigate to:
```
http://localhost:3001/video-call-demo.html
```

### 4. Create a Room
1. Enter your name and ID
2. Click "Create Room"
3. Copy the generated links to share with participants

### 5. Join a Room
1. Enter your name and ID
2. Click "Join Room"
3. Enter the Room ID provided by the host

## Reference Links

The system generates two types of reference links:

### Host Link
```
http://localhost:3001/video-call/{roomId}?role=host&id={hostId}&name={hostName}
```
- Contains host information
- Automatically sets up the host role
- Pre-fills participant details

### Guest Link
```
http://localhost:3001/video-call/{roomId}?role=guest
```
- Generic link for guests to join
- Requires manual entry of participant details

## WebRTC Configuration

The system uses Google's STUN servers for NAT traversal:
- `stun:stun.l.google.com:19302`
- `stun:stun1.l.google.com:19302`

For production, consider adding TURN servers for better connectivity.

## Security Considerations

- Room IDs are UUIDs (hard to guess)
- No authentication implemented (add as needed)
- CORS configured for localhost:3000
- Consider adding rate limiting for production

## Browser Compatibility

- Chrome/Chromium (recommended)
- Firefox
- Safari (limited WebRTC support)
- Edge

## Troubleshooting

### Common Issues

1. **Camera/Microphone Access Denied**
   - Ensure HTTPS in production
   - Check browser permissions

2. **Connection Failed**
   - Check firewall settings
   - Verify STUN server accessibility
   - Consider TURN servers for restrictive networks

3. **Audio/Video Not Working**
   - Check device permissions
   - Verify media device availability
   - Test with different browsers

### Development Tips

- Use Chrome DevTools for WebRTC debugging
- Check `chrome://webrtc-internals/` for connection details
- Monitor Socket.IO events in browser console

## Integration with SehatSetu

This video call system integrates with the SehatSetu telemedicine platform:

- **Patient Consultations**: Connect patients with doctors
- **Follow-up Appointments**: Schedule video consultations
- **Emergency Consultations**: Quick access to medical professionals
- **Health Record Integration**: Access patient data during calls

## Future Enhancements

- [ ] Screen sharing
- [ ] Chat functionality
- [ ] Call recording
- [ ] Multi-participant support
- [ ] Mobile app integration
- [ ] Authentication system
- [ ] Call scheduling
- [ ] Payment integration
