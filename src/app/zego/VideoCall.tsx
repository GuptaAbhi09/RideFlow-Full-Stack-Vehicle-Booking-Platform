"use client"

import React, { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface VideoCallProps {
  roomID: string
  active?: boolean
}

// Module-level variable to track the active instance
let activeZpInstance: any = null

const VideoCall = ({ roomID, active = true }: VideoCallProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()
  const isInitializing = useRef(false)
  const isUnmounted = useRef(false)
  const lastActiveRoom = useRef<string | null>(null)

  useEffect(() => {
    isUnmounted.current = false
    
    // Guards
    if (!containerRef.current || !session?.user?.id || !roomID) return
    
    // If not active, ensure any existing instance is destroyed and return
    if (!active) {
      if (activeZpInstance) {
        try {
          activeZpInstance.destroy()
        } catch (e) {}
        activeZpInstance = null
      }
      lastActiveRoom.current = null
      return
    }

    // If already active in the same room, don't re-init
    if (activeZpInstance && lastActiveRoom.current === roomID) return

    const initZego = async () => {
      if (isInitializing.current || isUnmounted.current || !active) return
      isInitializing.current = true

      try {
        // Cleanup previous
        if (activeZpInstance) {
          try {
            activeZpInstance.destroy()
          } catch (e) {}
          activeZpInstance = null
        }

        const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt")
        const { getZegoConfig } = await import("./utils")

        const { appID, serverSecret } = getZegoConfig()
        if (!appID || !serverSecret) {
          isInitializing.current = false
          return
        }

        if (isUnmounted.current || !active) return

        const userID = session.user.id
        const userName = session.user.name || "User"

        const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
          appID,
          serverSecret,
          roomID,
          userID,
          userName
        )

        const zp = ZegoUIKitPrebuilt.create(kitToken)
        activeZpInstance = zp
        lastActiveRoom.current = roomID

        // Ensure container still exists
        if (!containerRef.current || isUnmounted.current) {
          if (zp) zp.destroy()
          activeZpInstance = null
          return
        }

        containerRef.current.innerHTML = ''

        zp.joinRoom({
          container: containerRef.current,
          sharedLinks: [
            {
              name: 'KYC Meeting Link',
              url: window.location.origin + window.location.pathname + '?roomID=' + roomID,
            },
          ],
          scenario: {
            mode: ZegoUIKitPrebuilt.OneONoneCall,
          },
          showScreenSharingButton: false,
          showPreJoinView: false,
          showUserList: false,
          turnOnMicrophoneWhenJoining: true,
          turnOnCameraWhenJoining: true,
          showMyCameraToggleButton: true,
          showMyMicrophoneToggleButton: true,
          showAudioVideoSettingsButton: true,
          onLeaveRoom: () => {
            if (session.user.role === 'partner') {
              window.location.href = '/partner/dashboard'
            }
          }
        })
      } catch (error) {
        console.error("ZegoCloud: Initiation error:", error)
      } finally {
        isInitializing.current = false
      }
    }

    const timer = setTimeout(initZego, 400)

    return () => {
      isUnmounted.current = true
      clearTimeout(timer)
      
      // Deferred destruction to avoid 'createSpan' collision
      setTimeout(() => {
        if (activeZpInstance) {
          try {
            activeZpInstance.destroy()
          } catch (e) {}
          activeZpInstance = null
        }
      }, 150)
    }
  }, [roomID, session?.user?.id, active])

  return (
    <div 
      id="zego-container"
      ref={containerRef} 
      className="w-full h-full bg-[#0a0a0a]"
      style={{ width: '100%', height: '100%' }}
    />
  )
}

export default VideoCall
