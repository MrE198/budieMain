import { useAuthStore } from '@/stores/authStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { Task } from '@budie/shared';
import { Link } from 'react-router-dom';

export const DashboardPage = () => {
  const { user } = useAuthStore();

  // Fetch tasks
  const { data: tasksData, isLoading: tasksLoading } = useQuery({
    queryKey: ['tasks', 'dashboard'],
    queryFn: async () => {
      const response = await api.get('/tasks?limit=5&status=pending');
      return response.data;
    },
  });

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  // Get current date
  const getCurrentDate = () => {
    return new Date().toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900">
          {getGreeting()}, {user?.profile.name}! 👋
        </h1>
        <p className="mt-1 text-gray-600">{getCurrentDate()}</p>
        <p className="mt-4 text-gray-700">
          Welcome to Budie, your personal AI assistant. I'm here to help you organize your life and boost your productivity.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-accent-orange to-accent-orange-dark rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-100">Tasks Today</p>
              <p className="text-3xl font-bold mt-2">{tasksData?.tasks?.length || 0}</p>
            </div>
            <div className="text-4xl opacity-80">✓</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-gray-700 to-gray-900 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-300">Calendar Events</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="text-4xl opacity-80">📅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-100">Unread Messages</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <div className="text-4xl opacity-80">💬</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-sm p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-100">Productivity Score</p>
              <p className="text-3xl font-bold mt-2">85%</p>
            </div>
            <div className="text-4xl opacity-80">📈</div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Tasks */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow-sm">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Recent Tasks</h2>
              <Link to="/tasks" className="text-sm text-accent-orange hover:text-accent-orange-dark">
                View all →
              </Link>
            </div>
          </div>
          <div className="p-6">
            {tasksLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : tasksData?.tasks?.length > 0 ? (
              <div className="space-y-4">
                {tasksData.tasks.map((task: Task) => (
                  <div key={task.id} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                    <input
                      type="checkbox"
                      className="mt-1 h-4 w-4 text-accent-orange focus:ring-accent-orange border-gray-300 rounded"
                      checked={task.status === 'completed'}
                      readOnly
                    />
                    <div className="flex-1">
                      <h3 className="text-sm font-medium text-gray-900">{task.title}</h3>
                      <div className="mt-1 flex items-center space-x-2 text-xs text-gray-500">
                        <span className={`px-2 py-1 rounded-full ${
                          task.priority === 'urgent' ? 'bg-red-100 text-red-700' :
                          task.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                          task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {task.priority}
                        </span>
                        <span>{task.category}</span>
                        {task.dueDate && (
                          <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-gray-400 mb-4">
                  <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <p className="text-gray-500">No tasks yet</p>
                <Link to="/tasks" className="mt-2 inline-flex items-center text-sm text-accent-orange hover:text-accent-orange-dark">
                  Create your first task →
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="space-y-6">
          {/* AI Assistant */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">AI Assistant</h2>
            <div className="space-y-3">
              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Ask Budie</p>
                    <p className="text-xs text-gray-500">Get help with anything</p>
                  </div>
                </div>
              </button>
              <button className="w-full text-left p-3 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">📝</span>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Smart Suggestions</p>
                    <p className="text-xs text-gray-500">AI-powered task ideas</p>
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Integrations */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Integrations</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm">G</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Google</p>
                    <p className="text-xs text-gray-500">Not connected</p>
                  </div>
                </div>
                <button className="text-xs text-accent-orange hover:text-accent-orange-dark">
                  Connect
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">M</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Microsoft</p>
                    <p className="text-xs text-gray-500">Not connected</p>
                  </div>
                </div>
                <button className="text-xs text-accent-orange hover:text-accent-orange-dark">
                  Connect
                </button>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-sm text-white">W</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">WhatsApp</p>
                    <p className="text-xs text-gray-500">Not connected</p>
                  </div>
                </div>
                <button className="text-xs text-accent-orange hover:text-accent-orange-dark">
                  Connect
                </button>
              </div>
            </div>
          </div>

          {/* Quick Tips */}
          <div className="bg-gradient-to-br from-accent-orange to-accent-orange-dark rounded-lg shadow-sm p-6 text-white">
            <h3 className="text-lg font-semibold mb-2">💡 Quick Tip</h3>
            <p className="text-sm text-orange-100">
              You can use natural language to create tasks. Try "Remind me to call mom tomorrow at 3pm"
            </p>
          </div>
        </div>
      </div>

      {/* Upcoming Features */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-yellow-800">
              Coming Soon
            </h3>
            <div className="mt-2 text-sm text-yellow-700">
              <p>We're working on exciting new features including:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Calendar sync with Google and Outlook</li>
                <li>Email management and smart inbox</li>
                <li>WhatsApp and SMS integration</li>
                <li>AI-powered task prioritization</li>
                <li>Smart reminders and notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};