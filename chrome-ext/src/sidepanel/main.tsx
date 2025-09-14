import React from 'react'
import '@ext/styles/tailwind.css'
import '@ext/styles/toby-compat.css'
import { safeMount } from '@ext/shared/mount'
import TobyDashboard from '@/app/page'

safeMount(<TobyDashboard />)
