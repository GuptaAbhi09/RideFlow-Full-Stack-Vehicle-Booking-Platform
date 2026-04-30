"use client"

import React, { useEffect, useRef } from 'react'
import { useSession } from 'next-auth/react'

interface VideoCallProps {
  roomID: string
}

const VideoCall = ({ roomID }: VideoCallProps) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const { data: session } = useSession()

  useEffect(() => {
    const initZego = async () => {
      if (!containerRef.current || !session?.user) return

      // Dynamic import to avoid SSR issues
      const { ZegoUIKitPrebuilt } = await import("@zegocloud/zego-uikit-prebuilt")
      const { getZegoConfig } = await import("./utils")

      const { appID, serverSecret } = getZegoConfig()

      if (!appID || !serverSecret) {
        console.error("ZegoCloud AppID or ServerSecret is missing")
        return
      }

      const userID = session.user.id
      const userName = session.user.name || "Partner User"

      const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
        appID,
        serverSecret,
        roomID,
        userID,
        userName
      )

      const zp = ZegoUIKitPrebuilt.create(kitToken)

      zp.joinRoom({
        container: containerRef.current,
        sharedLinks: [
          {
            name: 'KYC Meeting Link',
            url: window.location.origin + window.location.pathname + '?roomID=' + roomID,
          },
        ],
        scenario: {
          mode: ZegoUIKitPrebuilt.OneONoneCall, // 1-on-1 for KYC
        },
        showScreenSharingButton: false,
        showPreJoinView: true,
        onLeaveRoom: () => {
          // Handle room leave
          window.location.href = '/partner/dashboard'
        }
      })
    }

    initZego()

    return () => {
      // Cleanup if needed (Zego usually handles its own cleanup on unmount if configured)
    }
  }, [roomID, session])

  return (
    <div 
      ref={containerRef} 
      className="w-full h-screen bg-black"
      style={{ width: '100vw', height: '100vh' }}
    />
  )
}

export default VideoCall
