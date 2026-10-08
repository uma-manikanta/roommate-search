import matplotlib.pyplot as plt
import numpy as np
import os

endpoints = ['/api/auth/login', '/api/profile/update', '/api/match/find', '/api/messages']
avg_latency = [125, 80, 210, 45]
p99_latency = [180, 110, 310, 85]

x = np.arange(len(endpoints))
width = 0.35

fig, ax = plt.subplots(figsize=(8, 5))
rects1 = ax.bar(x - width/2, avg_latency, width, label='Avg Latency (ms)', color='#4c72b0')
rects2 = ax.bar(x + width/2, p99_latency, width, label='p99 Latency (ms)', color='#dd8452')

ax.set_ylabel('Latency (ms)')
ax.set_title('API Response Latency by Endpoint')
ax.set_xticks(x)
ax.set_xticklabels(endpoints)
ax.legend()
ax.grid(axis='y', linestyle='--', alpha=0.7)

fig.tight_layout()
os.makedirs('diagrams', exist_ok=True)
plt.savefig('diagrams/api_latency.png', dpi=300)
