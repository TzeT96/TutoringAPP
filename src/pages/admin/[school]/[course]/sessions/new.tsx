import { useState } from 'react';
import { useRouter } from 'next/router';
import { useSession } from 'next-auth/react';
import AdminLayout from '@/components/Layout_Courses';
import { Button, Container, TextField, Typography, Box, Paper } from '@mui/material';

export default function NewSessionPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/admin/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to create session');
      }

      const data = await response.json();
      router.push(`/admin/sessions/${data.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!session) {
    return (
      <Container maxWidth="sm">
        <Typography variant="h4" align="center" gutterBottom>
          Access Denied
        </Typography>
        <Typography align="center">
          Please sign in to create a new session.
        </Typography>
      </Container>
    );
  }

  return (
    <AdminLayout>
      <Container maxWidth="sm">
        <Box sx={{ mt: 4 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h5" component="h1" gutterBottom>
              Create New Session
            </Typography>
            <form onSubmit={handleSubmit}>
              <TextField
                fullWidth
                label="Verification Code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                margin="normal"
                required
                error={!!error}
                helperText={error || 'Enter a unique code for this session'}
                disabled={isSubmitting}
              />
              <Box sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  fullWidth
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Creating...' : 'Create Session'}
                </Button>
              </Box>
            </form>
          </Paper>
        </Box>
      </Container>
    </AdminLayout>
  );
} 