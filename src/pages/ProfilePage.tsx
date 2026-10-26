import { useState, type FormEvent } from "react"
import type { User } from "firebase/auth"
import { SettingsLayout, SettingsRow } from "@/components/site/SettingsLayout"
import { UserAvatar } from "@/components/ui/UserAvatar"
import { Icon } from "@/components/ui/Icon"
import { useAuth } from "@/services/firebase/useAuth"
import { getAuthErrorMessage } from "@/services/firebase/authErrors"
import { deleteConversation, listConversations } from "@/services/chat/conversationsApi"
import { clearConversations } from "@/services/chat/chatStorage"

const PROVIDER_NAMES: Record<string, string> = {
  "google.com": "Google",
  "github.com": "GitHub",
  password: "Correo y contraseña",
}

export function ProfilePage({ user }: { user: User }) {
  const { signOut, updateDisplayName, deleteAccount } = useAuth()
  const [name, setName] = useState(user.displayName ?? "")
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<{ ok: boolean; text: string } | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState<string | null>(null)

  const providerId = user.providerData[0]?.providerId ?? "password"
  const providerName = PROVIDER_NAMES[providerId] ?? providerId
  const hasProviderPhoto = Boolean(user.photoURL)
  const nameChanged = name.trim() !== (user.displayName ?? "") && name.trim().length > 0

  const handleSave = async (event: FormEvent) => {
    event.preventDefault()
    if (!nameChanged) return
    setIsSaving(true)
    setSaveMessage(null)
    try {
      await updateDisplayName(name.trim())
      setSaveMessage({ ok: true, text: "Cambios guardados." })
    } catch (err) {
      setSaveMessage({ ok: false, text: getAuthErrorMessage(err, "No pudimos guardar tu nombre. Inténtalo de nuevo.") })
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError(null)
    try {
      const idToken = await user.getIdToken()
      const conversations = await listConversations(idToken)
      for (const conversation of conversations) {
        await deleteConversation(conversation.id, idToken)
      }
      clearConversations(user.uid)
      await deleteAccount()
    } catch (err) {
      setDeleteError(getAuthErrorMessage(err, "No pudimos eliminar tu cuenta. Inténtalo de nuevo."))
      setIsDeleting(false)
    }
  }

  return (
    <SettingsLayout title="Perfil y cuenta">
      <div className="profileHead">
        <UserAvatar name={user.displayName ?? user.email} photoUrl={user.photoURL} size={72} />
        <div>
          <p className="profileHead__name">{user.displayName ?? user.email}</p>
          <p className="profileHead__note">
            {hasProviderPhoto ? `Tu foto viene de tu cuenta de ${providerName}.` : "Usamos la inicial de tu nombre como avatar."}
          </p>
        </div>
      </div>

      <h2 className="settings__section">Datos</h2>
      <form className="profileForm" onSubmit={handleSave}>
        <div className="profileForm__grid">
          <div className="field">
            <label className="field__label" htmlFor="profile-name">Nombre</label>
            <input
              id="profile-name"
              className="input"
              value={name}
              autoComplete="name"
              onChange={(event) => {
                setName(event.target.value)
                setSaveMessage(null)
              }}
            />
          </div>
          <div className="field">
            <label className="field__label" htmlFor="profile-email">Correo electrónico</label>
            <input id="profile-email" className="input" value={user.email ?? ""} readOnly />
          </div>
        </div>
        <div className="profileForm__actions">
          <button className="btn btn--sm btn--primary" type="submit" disabled={!nameChanged || isSaving}>
            {isSaving ? "Guardando…" : "Guardar cambios"}
          </button>
          {saveMessage ? (
            <span className={saveMessage.ok ? "profileForm__ok" : "field__error"} role="status">
              <Icon name={saveMessage.ok ? "check" : "alert"} size={14} />
              {saveMessage.text}
            </span>
          ) : null}
        </div>
      </form>

      <h2 className="settings__section">Acceso</h2>
      <SettingsRow title="Método de inicio de sesión" description={`${providerName} · ${user.email ?? ""}`}>
        <span className="badge">Conectado</span>
      </SettingsRow>
      <SettingsRow title="Cerrar sesión" description="Tus conversaciones seguirán guardadas en tu cuenta.">
        <button className="btn btn--sm btn--secondary" type="button" onClick={() => void signOut()}>
          Cerrar sesión
        </button>
      </SettingsRow>

      <h2 className="settings__section">Zona de riesgo</h2>
      {confirmDelete ? (
        <div className="confirmBox" role="alertdialog" aria-labelledby="delete-title" aria-describedby="delete-desc">
          <div className="confirmBox__copy">
            <p id="delete-title" className="confirmBox__title">¿Eliminar tu cuenta?</p>
            <p id="delete-desc" className="confirmBox__desc">
              Se borran tu cuenta y todas tus conversaciones de forma permanente. No se puede deshacer.
            </p>
            {deleteError ? (
              <p className="field__error" role="alert">
                <Icon name="alert" size={14} />
                {deleteError}
              </p>
            ) : null}
          </div>
          <div className="confirmBox__actions">
            <button className="btn btn--sm btn--secondary" type="button" onClick={() => setConfirmDelete(false)} disabled={isDeleting}>
              Cancelar
            </button>
            <button className="btn btn--sm btn--danger-solid" type="button" onClick={() => void handleDelete()} disabled={isDeleting}>
              {isDeleting ? "Eliminando…" : "Eliminar cuenta"}
            </button>
          </div>
        </div>
      ) : (
        <SettingsRow title="Eliminar cuenta" description="Borra tu cuenta y todas tus conversaciones de forma permanente.">
          <button className="btn btn--sm btn--danger" type="button" onClick={() => setConfirmDelete(true)}>
            Eliminar cuenta
          </button>
        </SettingsRow>
      )}
    </SettingsLayout>
  )
}
