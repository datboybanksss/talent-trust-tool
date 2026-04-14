/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface InviteEmailProps {
  siteName: string
  siteUrl: string
  confirmationUrl: string
}

export const InviteEmail = ({
  siteName,
  siteUrl,
  confirmationUrl,
}: InviteEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>You've been invited to join {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={header}>
          <Heading style={logo}>Legacy<span style={{ color: '#ffffff' }}>Builder</span></Heading>
        </Section>
        <Section style={body}>
          <Heading style={h1}>You've been invited</Heading>
          <Text style={text}>
            You've been invited to join{' '}
            <Link href={siteUrl} style={link}><strong>{siteName}</strong></Link>.
            Click the button below to accept the invitation and create your account.
          </Text>
          <Button style={button} href={confirmationUrl}>
            Accept Invitation
          </Button>
          <Text style={footerText}>
            If you weren't expecting this invitation, you can safely ignore this email.
          </Text>
        </Section>
        <Section style={footerSection}>
          <Text style={footerBrand}>© {new Date().getFullYear()} LegacyBuilder · Protecting What Matters Most</Text>
        </Section>
      </Container>
    </Body>
  </Html>
)

export default InviteEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'Aptos', Calibri, Arial, sans-serif" } as const
const container = { maxWidth: '600px', margin: '0 auto' } as const
const header = { backgroundColor: '#1B4332', padding: '28px 32px', textAlign: 'center' as const, borderRadius: '8px 8px 0 0' }
const logo = { margin: '0', fontFamily: "'Playfair Display', Georgia, serif", fontSize: '24px', color: '#C9A84C', fontWeight: '700' as const }
const body = { padding: '32px' }
const h1 = { fontSize: '22px', fontWeight: 'bold' as const, color: '#1B4332', margin: '0 0 20px', fontFamily: "'Playfair Display', Georgia, serif" }
const text = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 14px' }
const link = { color: '#1B4332', textDecoration: 'underline' }
const button = { backgroundColor: '#1B4332', color: '#C9A84C', fontSize: '15px', borderRadius: '6px', padding: '12px 28px', textDecoration: 'none', fontWeight: '600' as const }
const footerText = { fontSize: '13px', color: '#6B7280', margin: '24px 0 0' }
const footerSection = { backgroundColor: '#F9FAFB', padding: '20px 32px', textAlign: 'center' as const, borderTop: '1px solid #e5e7eb', borderRadius: '0 0 8px 8px' }
const footerBrand = { margin: '0', fontSize: '12px', color: '#6B7280' }
