// Production deployment configuration
const deploymentConfig = {
  // Build configuration
  build: {
    // Output directory
    outputDir: './build',
    
    // Build optimization settings
    optimization: {
      minimize: true,
      treeshaking: true,
      codesplitting: true,
      lazyLoading: true,
    },
    
    // Environment variables for production
    env: {
      NODE_ENV: 'production',
      NEXT_TELEMETRY_DISABLED: '1',
      
      // API endpoints
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.chickapi.com',
      NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL || 'wss://ws.chickapi.com',
      
      // Feature flags
      NEXT_PUBLIC_ENABLE_COLLABORATION: process.env.NEXT_PUBLIC_ENABLE_COLLABORATION || 'true',
      NEXT_PUBLIC_ENABLE_ANALYTICS: process.env.NEXT_PUBLIC_ENABLE_ANALYTICS || 'true',
      NEXT_PUBLIC_ENABLE_PWA: process.env.NEXT_PUBLIC_ENABLE_PWA || 'true',
      
      // Performance monitoring
      NEXT_PUBLIC_SENTRY_DSN: process.env.NEXT_PUBLIC_SENTRY_DSN,
      NEXT_PUBLIC_ANALYTICS_ID: process.env.NEXT_PUBLIC_ANALYTICS_ID,
      
      // Database
      DATABASE_URL: process.env.DATABASE_URL,
      REDIS_URL: process.env.REDIS_URL,
      
      // Authentication
      AUTH_SECRET: process.env.AUTH_SECRET,
      GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
      GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
      
      // File storage
      AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
      AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
      AWS_REGION: process.env.AWS_REGION || 'us-east-1',
      AWS_S3_BUCKET: process.env.AWS_S3_BUCKET,
    },
  },
  
  // Docker configuration
  docker: {
    baseImage: 'node:18-alpine',
    workdir: '/app',
    ports: {
      web: 3000,
      api: 3001,
    },
    
    // Multi-stage build configuration
    stages: [
      {
        name: 'dependencies',
        commands: [
          'COPY package*.json ./',
          'RUN npm ci --only=production && npm cache clean --force',
        ],
      },
      {
        name: 'builder',
        commands: [
          'COPY . .',
          'RUN npm run build',
        ],
      },
      {
        name: 'runner',
        commands: [
          'RUN addgroup --system --gid 1001 nodejs',
          'RUN adduser --system --uid 1001 nextjs',
          'COPY --from=builder /app/public ./public',
          'COPY --from=builder /app/.next/standalone ./',
          'COPY --from=builder /app/.next/static ./.next/static',
          'USER nextjs',
          'EXPOSE 3000',
          'ENV PORT 3000',
          'CMD ["node", "server.js"]',
        ],
      },
    ],
  },
  
  // Kubernetes deployment
  kubernetes: {
    namespace: 'chickapi-prod',
    
    deployment: {
      name: 'chickapi-web',
      replicas: 3,
      
      containers: [
        {
          name: 'web',
          image: 'chickapi/web:latest',
          ports: [{ containerPort: 3000 }],
          
          resources: {
            requests: {
              cpu: '100m',
              memory: '128Mi',
            },
            limits: {
              cpu: '500m',
              memory: '512Mi',
            },
          },
          
          readinessProbe: {
            httpGet: {
              path: '/api/health',
              port: 3000,
            },
            initialDelaySeconds: 10,
            periodSeconds: 5,
          },
          
          livenessProbe: {
            httpGet: {
              path: '/api/health',
              port: 3000,
            },
            initialDelaySeconds: 30,
            periodSeconds: 10,
          },
        },
      ],
    },
    
    service: {
      name: 'chickapi-web-service',
      type: 'LoadBalancer',
      ports: [
        {
          port: 80,
          targetPort: 3000,
          protocol: 'TCP',
        },
      ],
    },
    
    ingress: {
      name: 'chickapi-ingress',
      annotations: {
        'kubernetes.io/ingress.class': 'nginx',
        'cert-manager.io/cluster-issuer': 'letsencrypt-prod',
        'nginx.ingress.kubernetes.io/ssl-redirect': 'true',
      },
      
      tls: [
        {
          hosts: ['chickapi.com', 'www.chickapi.com'],
          secretName: 'chickapi-tls',
        },
      ],
      
      rules: [
        {
          host: 'chickapi.com',
          http: {
            paths: [
              {
                path: '/',
                pathType: 'Prefix',
                backend: {
                  service: {
                    name: 'chickapi-web-service',
                    port: { number: 80 },
                  },
                },
              },
            ],
          },
        },
      ],
    },
  },
  
  // Monitoring and logging
  monitoring: {
    // Prometheus metrics
    prometheus: {
      enabled: true,
      port: 9090,
      path: '/metrics',
    },
    
    // Application performance monitoring
    apm: {
      enabled: true,
      service: 'chickapi-web',
      environment: 'production',
    },
    
    // Logging configuration
    logging: {
      level: 'info',
      format: 'json',
      transports: ['console', 'file'],
      
      destinations: {
        elasticsearch: {
          host: process.env.ELASTICSEARCH_HOST,
          index: 'chickapi-logs',
        },
        
        cloudwatch: {
          logGroup: '/aws/lambda/chickapi-web',
          logStream: 'production',
        },
      },
    },
    
    // Error tracking
    errorTracking: {
      sentry: {
        dsn: process.env.SENTRY_DSN,
        environment: 'production',
        tracesSampleRate: 0.1,
      },
    },
  },
  
  // CDN and caching
  cdn: {
    cloudfront: {
      enabled: true,
      
      distributions: [
        {
          comment: 'ChickAPI Web Application',
          
          origins: [
            {
              domainName: 'chickapi-web.us-east-1.elb.amazonaws.com',
              originId: 'web-origin',
            },
          ],
          
          defaultCacheBehavior: {
            targetOriginId: 'web-origin',
            viewerProtocolPolicy: 'redirect-to-https',
            compress: true,
            
            cachePolicyId: 'managed-caching-optimized',
            originRequestPolicyId: 'managed-CORS-S3Origin',
          },
          
          cacheBehaviors: [
            {
              pathPattern: '/static/*',
              targetOriginId: 'web-origin',
              viewerProtocolPolicy: 'https-only',
              compress: true,
              cachePolicyId: 'managed-caching-optimized',
              ttl: 31536000, // 1 year
            },
            {
              pathPattern: '/_next/static/*',
              targetOriginId: 'web-origin',
              viewerProtocolPolicy: 'https-only',
              compress: true,
              cachePolicyId: 'managed-caching-optimized',
              ttl: 31536000, // 1 year
            },
            {
              pathPattern: '/api/*',
              targetOriginId: 'web-origin',
              viewerProtocolPolicy: 'https-only',
              cachePolicyId: 'managed-caching-disabled',
            },
          ],
        },
      ],
    },
    
    // Redis caching
    redis: {
      host: process.env.REDIS_HOST,
      port: process.env.REDIS_PORT || 6379,
      password: process.env.REDIS_PASSWORD,
      
      cacheConfig: {
        ttl: 3600, // 1 hour default
        
        strategies: {
          'workflow-data': { ttl: 1800 }, // 30 minutes
          'user-sessions': { ttl: 86400 }, // 24 hours
          'api-responses': { ttl: 300 }, // 5 minutes
        },
      },
    },
  },
  
  // Security configuration
  security: {
    // Rate limiting
    rateLimit: {
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit each IP to 100 requests per windowMs
      
      endpoints: {
        '/api/auth/*': { max: 5, windowMs: 15 * 60 * 1000 },
        '/api/workflows/*': { max: 50, windowMs: 15 * 60 * 1000 },
        '/api/execute/*': { max: 10, windowMs: 60 * 1000 },
      },
    },
    
    // CORS configuration
    cors: {
      origin: [
        'https://chickapi.com',
        'https://www.chickapi.com',
        'https://app.chickapi.com',
      ],
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key'],
    },
    
    // CSP headers
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", 'https://cdn.jsdelivr.net'],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'", 'https://api.chickapi.com', 'wss://ws.chickapi.com'],
      },
    },
  },
  
  // Backup and disaster recovery
  backup: {
    database: {
      schedule: '0 2 * * *', // Daily at 2 AM
      retention: 30, // Keep 30 days
      encryption: true,
      
      destinations: [
        's3://chickapi-backups/database/',
        'gs://chickapi-backups/database/',
      ],
    },
    
    files: {
      schedule: '0 3 * * 0', // Weekly on Sunday at 3 AM
      retention: 12, // Keep 12 weeks
      compression: true,
      
      destinations: [
        's3://chickapi-backups/files/',
      ],
    },
  },
  
  // Scaling configuration
  scaling: {
    // Horizontal Pod Autoscaler
    hpa: {
      minReplicas: 3,
      maxReplicas: 20,
      
      metrics: [
        {
          type: 'Resource',
          resource: {
            name: 'cpu',
            target: {
              type: 'Utilization',
              averageUtilization: 70,
            },
          },
        },
        {
          type: 'Resource',
          resource: {
            name: 'memory',
            target: {
              type: 'Utilization',
              averageUtilization: 80,
            },
          },
        },
      ],
    },
    
    // Database scaling
    database: {
      readReplicas: 2,
      connectionPooling: {
        maxConnections: 100,
        acquireTimeout: 10000,
        createTimeout: 10000,
        destroyTimeout: 5000,
        idleTimeout: 300000,
        reapInterval: 1000,
      },
    },
  },
}

module.exports = deploymentConfig
