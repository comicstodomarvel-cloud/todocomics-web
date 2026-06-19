export interface DiscordData {
  guildName: string
  guildId: string
  iconHash: string | null
  memberCount: number
  onlineCount: number
  inviteCode: string
}

const INVITE_CODE = 'nKTnYSTRHE'
const GUILD_ID = '977358920702119997'

async function fetchFromInviteAPI(): Promise<DiscordData | null> {
  const res = await fetch(
    `https://discord.com/api/v10/invites/${INVITE_CODE}?with_counts=true`,
    {
      headers: { 'User-Agent': 'TodoComics/1.0' },
      next: { revalidate: 120 },
    }
  )
  if (!res.ok) return null
  const json = await res.json()
  return {
    guildName: json.guild?.name ?? 'TodoComics',
    guildId: json.guild?.id ?? GUILD_ID,
    iconHash: json.guild?.icon ?? null,
    memberCount: json.approximate_member_count ?? 0,
    onlineCount: json.approximate_presence_count ?? 0,
    inviteCode: INVITE_CODE,
  }
}

async function fetchFromWidgetAPI(): Promise<DiscordData | null> {
  try {
    const res = await fetch(
      `https://discord.com/api/guilds/${GUILD_ID}/widget.json`,
      {
        headers: { 'User-Agent': 'TodoComics/1.0' },
        next: { revalidate: 120 },
      }
    )
    if (!res.ok) return null
    const json = await res.json()
      return {
      guildName: json.name ?? 'TodoComics',
      guildId: GUILD_ID,
      iconHash: null,
      memberCount: json.members?.length ?? 0,
      onlineCount: json.presence_count ?? 0,
      inviteCode: INVITE_CODE,
    }
  } catch {
    return null
  }
}

export async function getDiscordData(): Promise<DiscordData | null> {
  const fromInvite = await fetchFromInviteAPI()
  if (fromInvite) return fromInvite
  return fetchFromWidgetAPI()
}
