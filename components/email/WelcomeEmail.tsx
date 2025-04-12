import * as React from 'react';
import {
  Body,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section,
  Hr,
  Img,
  Link,
  Row,
} from "@react-email/components";

interface WelcomeEmailProps {
  name?: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  name = "there",
}) => (
  <Html>
    <Head />
    <Preview>Welcome to Invest Assist - Your Financial Intelligence Platform</Preview>
    <Body style={main}>
      <Container style={container}>
        <Section style={logo}>
          <Img 
            src="https://dd.dexscreener.com/ds-data/tokens/solana/8KxEiudmUF5tpJKK4uHzjDuJPGKUz9hYUDBEVcfdpump.png?key=733897" 
            alt="Invest Assist Logo" 
            width={100} 
            height={100} 
          />
        </Section>

        <Section style={header}>
          <Row>
            <Column style={headerContent}>
              <Heading style={headerContentTitle}>Welcome to Invest Assist!</Heading>
              <Text style={headerContentSubtitle}>
                Your Financial Intelligence Platform
              </Text>
            </Column>
            <Column style={headerImageContainer}>
              <Img
                style={headerImage}
                width={340}
                src="https://dd.dexscreener.com/ds-data/tokens/solana/8KxEiudmUF5tpJKK4uHzjDuJPGKUz9hYUDBEVcfdpump.png?key=733897"
                alt="Invest Assist"
              />
            </Column>
          </Row>
        </Section>

        <Section style={content}>
          <Text style={paragraph}>
            Hi {name},
          </Text>
          <Text style={paragraph}>
            Thank you for signing up for Invest Assist. We&apos;re excited to have you on board!
          </Text>
          <Text style={paragraph}>
            With Invest Assist, you&apos;ll receive:
          </Text>
          <ul>
            <li>
              <Text style={paragraph}>Real-time market insights and trends</Text>
            </li>
            <li>
              <Text style={paragraph}>Personalized investment recommendations</Text>
            </li>
            <li>
              <Text style={paragraph}>Updates on market movements and opportunities</Text>
            </li>
            <li>
              <Text style={paragraph}>Exclusive content and analysis</Text>
            </li>
          </ul>

          <Hr style={divider} />

          <Section style={buttonContainer}>
            <Button style={button} href="https://investassist.app">
              Explore Invest Assist
            </Button>
          </Section>

          <Text style={paragraph}>
            If you have any questions, feel free to reply to this email.
          </Text>
          <Text style={paragraph}>
            Best regards,<br />
            The Invest Assist Team
          </Text>
        </Section>
      </Container>

      <Section style={footer}>
        <Text style={footerText}>
          You&apos;re receiving this email because you signed up for Invest Assist.
        </Text>

        {/* <Link href="https://investassist.app/unsubscribe" style={footerLink}>
          Unsubscribe from emails like this{' '}
        </Link>
        <Link href="https://investassist.app/settings" style={footerLink}>
          Edit email settings{' '}
        </Link>
        <Link href="https://investassist.app/contact" style={footerLink}>
          Contact us
        </Link>
        <Link href="https://investassist.app/privacy" style={footerLink}>
          Privacy
        </Link> */}

        <Hr style={footerDivider} />

        <Img 
          width={100} 
          height={100} 
          src="https://dd.dexscreener.com/ds-data/tokens/solana/8KxEiudmUF5tpJKK4uHzjDuJPGKUz9hYUDBEVcfdpump.png?key=733897" 
          alt="Invest Assist Logo" 
        />
        <Text style={footerAddress}>
          <strong>Invest Assist</strong>, Financial Intelligence Platform
        </Text>
      </Section>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  width: '680px',
  maxWidth: '100%',
  margin: '0 auto',
  backgroundColor: '#ffffff',
};

const logo = {
  display: 'flex',
  justifyContent: 'center',
  background: '#f6f9fc',
  padding: '20px 30px',
};

const header = {
  borderRadius: '5px 5px 0 0',
  display: 'flex',
  flexDirection: 'column' as const,
  backgroundColor: '#0070f3',
};

const headerContent = { 
  padding: '20px 30px 15px',
  color: '#ffffff',
};

const headerContentTitle = {
  color: '#fff',
  fontSize: '27px',
  fontWeight: 'bold',
  lineHeight: '27px',
  margin: '0 0 10px',
};

const headerContentSubtitle = {
  color: '#fff',
  fontSize: '17px',
  margin: '0',
};

const headerImageContainer = {
  padding: '30px 10px',
  textAlign: 'center' as const,
};

const headerImage = {
  maxWidth: '100%',
};

const content = {
  padding: '30px 30px 40px 30px',
};

const paragraph = {
  fontSize: '15px',
  lineHeight: '21px',
  color: '#3c3f44',
  margin: '0 0 15px',
};

const divider = {
  margin: '30px 0',
  borderColor: '#e6ebf1',
};

const buttonContainer = {
  textAlign: 'center' as const,
  margin: '30px 0',
};

const button = {
  backgroundColor: '#0070f3',
  borderRadius: '5px',
  color: '#fff',
  fontSize: '16px',
  fontWeight: '600',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '12px 24px',
};

const footer = {
  width: '680px',
  maxWidth: '100%',
  margin: '32px auto 0 auto',
  padding: '0 30px',
  textAlign: 'center' as const,
};

const footerText = {
  fontSize: '12px',
  lineHeight: '15px',
  color: '#8898aa',
  margin: '0 0 15px',
};

const footerLink = {
  display: 'inline-block',
  color: '#8898aa',
  textDecoration: 'underline',
  fontSize: '12px',
  marginRight: '10px',
  marginBottom: '0',
  marginTop: '8px',
};

const footerDivider = {
  margin: '30px 0',
  borderColor: '#e6ebf1',
};

const footerAddress = {
  margin: '4px 0',
  fontSize: '12px',
  lineHeight: '15px',
  color: '#8898aa',
}; 