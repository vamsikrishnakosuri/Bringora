import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { Check, X, Users, FileText, Clock } from 'lucide-react'

interface HelperApplication {
  id: string
  user_id: string
  status: string
  created_at: string
  user_email?: string
}

interface HelpRequest {
  id: string
  title: string
  status: string
  created_at: string
}

export default function AdminDashboard() {
  const navigate = useNavigate()
  const { user } = useAuth()

  const [applications, setApplications] = useState<HelperApplication[]>([])
  const [requests, setRequests] = useState<HelpRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRequests: 0,
    pendingApplications: 0,
  })

  useEffect(() => {
    if (!user) {
      navigate('/auth')
      return
    }

    // Check if user is admin (you'd implement proper admin check)
    loadData()
  }, [user, navigate])

  const loadData = async () => {
    try {
      // Load helper applications
      const { data: apps } = await supabase
        .from('helper_applications')
        .select('*, profiles(email)')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })

      if (apps) {
        setApplications(
          apps.map((app: any) => ({
            ...app,
            user_email: app.profiles?.email || 'N/A',
          }))
        )
      }

      // Load recent requests
      const { data: reqs } = await supabase
        .from('help_requests')
        .select('id, title, status, created_at')
        .order('created_at', { ascending: false })
        .limit(10)

      if (reqs) {
        setRequests(reqs)
      }

      // Load stats
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      const { count: requestCount } = await supabase
        .from('help_requests')
        .select('*', { count: 'exact', head: true })

      const { count: pendingCount } = await supabase
        .from('helper_applications')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'pending')

      setStats({
        totalUsers: userCount || 0,
        totalRequests: requestCount || 0,
        pendingApplications: pendingCount || 0,
      })
    } catch (err) {
      console.error('Error loading admin data:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleApproveApplication = async (applicationId: string, userId: string) => {
    try {
      const { error } = await supabase
        .from('helper_applications')
        .update({
          status: 'approved',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', applicationId)

      if (error) throw error

      // Update user profile to mark as helper
      await supabase
        .from('profiles')
        .update({ is_helper: true, is_approved: true })
        .eq('id', userId)

      loadData()
    } catch (err) {
      console.error('Error approving application:', err)
      alert('Failed to approve application')
    }
  }

  const handleRejectApplication = async (applicationId: string) => {
    try {
      const { error } = await supabase
        .from('helper_applications')
        .update({
          status: 'rejected',
          reviewed_at: new Date().toISOString(),
          reviewed_by: user?.id,
        })
        .eq('id', applicationId)

      if (error) throw error

      loadData()
    } catch (err) {
      console.error('Error rejecting application:', err)
      alert('Failed to reject application')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background dark:bg-background-dark">
        <p className="text-muted dark:text-muted">Loading...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark py-12 px-4">
      <div className="container mx-auto max-w-7xl">
        <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-foreground dark:bg-foreground flex items-center justify-center">
                <Users className="w-6 h-6 text-background dark:text-background-dark" />
              </div>
              <div>
                <p className="text-sm text-muted dark:text-muted">Total Users</p>
                <p className="text-2xl font-bold">{stats.totalUsers}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-foreground dark:bg-foreground flex items-center justify-center">
                <FileText className="w-6 h-6 text-background dark:text-background-dark" />
              </div>
              <div>
                <p className="text-sm text-muted dark:text-muted">Total Requests</p>
                <p className="text-2xl font-bold">{stats.totalRequests}</p>
              </div>
            </div>
          </Card>

          <Card>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-foreground dark:bg-foreground flex items-center justify-center">
                <Clock className="w-6 h-6 text-background dark:text-background-dark" />
              </div>
              <div>
                <p className="text-sm text-muted dark:text-muted">Pending Applications</p>
                <p className="text-2xl font-bold">{stats.pendingApplications}</p>
              </div>
            </div>
          </Card>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Helper Applications */}
          <Card>
            <h2 className="text-2xl font-bold mb-6">Helper Applications</h2>
            {applications.length === 0 ? (
              <p className="text-muted dark:text-muted">No pending applications</p>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className="p-4 border border-border dark:border-border-dark rounded-lg"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-medium">{app.user_email}</p>
                        <p className="text-sm text-muted dark:text-muted">
                          {new Date(app.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => handleApproveApplication(app.id, app.user_id)}
                        className="flex-1"
                      >
                        <Check className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRejectApplication(app.id)}
                        className="flex-1"
                      >
                        <X className="w-4 h-4 mr-2" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* Recent Requests */}
          <Card>
            <h2 className="text-2xl font-bold mb-6">Recent Requests</h2>
            {requests.length === 0 ? (
              <p className="text-muted dark:text-muted">No requests yet</p>
            ) : (
              <div className="space-y-4">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 border border-border dark:border-border-dark rounded-lg"
                  >
                    <p className="font-medium mb-1">{req.title}</p>
                    <div className="flex items-center justify-between">
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          req.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-300'
                            : req.status === 'completed'
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300'
                            : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {req.status}
                      </span>
                      <span className="text-sm text-muted dark:text-muted">
                        {new Date(req.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}



