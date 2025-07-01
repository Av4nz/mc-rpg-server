"use client"
import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Power, RefreshCw, Play } from 'lucide-react';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uptime, setUptime] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/status`);
        const json = await res.json();
        setData(json);
        if (json.uptime) setUptime(json.uptime);
      } catch (err) {
        console.error('Failed to fetch server status', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleRestart = async () => {
    await fetch('http://localhost:3001/api/restart', { method: 'POST' });
  };

  const handleShutdown = async () => {
    await fetch('http://localhost:3001/api/shutdown', { method: 'POST' });
  };

  const handleStart = async () => {
    await fetch('http://localhost:3001/api/start', { method: 'POST' });
  };

  if (loading) return <div className="flex justify-center p-10"><Loader2 className="animate-spin mr-2" />Loading...</div>;
  if (!data || !data.online) return (
    <div className="text-center p-6">
      <p className="text-red-500 text-lg mb-4">Server Offline</p>
      <Button onClick={handleStart}><Play className="w-4 h-4 mr-2" /> Start Server</Button>
    </div>
  );

  return (
    <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">Server Info</h2>
          <p className="text-sm text-muted-foreground">MOTD: {data.motd}</p>
          <p className="text-sm">Version: {data.version}</p>
          <p className="text-sm">Uptime: {uptime || 'N/A'}</p>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">Player Count</h2>
          <p className="text-sm">{data.players.online} / {data.players.max}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {data.players.list.map((name, idx) => (
              <Badge key={idx}>{name}</Badge>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">CPU Usage</h2>
          <p className="text-sm mb-2">{data.cpuUsage}%</p>
          <Progress value={data.cpuUsage} />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <h2 className="text-xl font-semibold">RAM Usage</h2>
          <p className="text-sm mb-2">{data.ramUsedMb} MB / {data.ramTotalMb} MB</p>
          <Progress value={(data.ramUsedMb / data.ramTotalMb) * 100} />
        </CardContent>
      </Card>

      <Card className="md:col-span-2">
        <CardContent className="p-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Server Controls</h2>
          <div className="flex gap-2">
            <Button onClick={handleStart} variant="default"><Play className="w-4 h-4 mr-2" /> Start</Button>
            <Button onClick={handleRestart} variant="outline"><RefreshCw className="w-4 h-4 mr-2" /> Restart</Button>
            <Button onClick={handleShutdown} variant="destructive"><Power className="w-4 h-4 mr-2" /> Shutdown</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

