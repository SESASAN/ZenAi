import { useState } from "react"

/** Profile photo from the sign-in provider, or the initial on a graphite circle. */
export function UserAvatar({
  name,
  photoUrl,
  size = 32,
}: {
  name?: string | null
  photoUrl?: string | null
  size?: number
}) {
  const [isImageValid, setIsImageValid] = useState(true)
  const initial = (name ?? "U").trim().slice(0, 1).toUpperCase() || "U"
  const showImage = Boolean(photoUrl) && isImageValid

  return (
    <span
      className="userAvatar"
      aria-hidden="true"
      style={{ width: size, height: size, fontSize: Math.round(size * 0.4) }}
    >
      {showImage ? (
        <img
          src={photoUrl ?? ""}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => setIsImageValid(false)}
        />
      ) : (
        initial
      )}
    </span>
  )
}
