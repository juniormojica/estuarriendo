$filePath = "c:\Users\mojic\OneDrive\Documentos\estuarriendo\frontend\src\services\api.ts"
$content = Get-Content $filePath -Raw -Encoding UTF8

# Replace approveProperty function
$oldApprove = @'
  async approveProperty(id: string): Promise<boolean> {
    await delay(500);
    const properties = getStoredProperties();
    const property = properties.find(p => p.id === id);
    if (property) {
      property.status = 'approved';
      saveProperties(properties);

      // Create notification for owner
      const ownerId = property.ownerId;
      if (ownerId) {
        const notifications = localStorage.getItem('estuarriendo_notifications');
        let parsedNotifications: Notification[] = [];
        if (notifications) {
          try ={
            parsedNotifications = JSON.parse(notifications);
          } catch (e) {
            console.error('Error parsing notifications', e);
          }
        }

        const newNotification: Notification = {
          id: Date.now().toString(),
          userId: ownerId,
          type: 'property_approved',
          title: 'Propiedad Aprobada',
          message: `Tu propiedad \"${property.title}\" ha sido aprobada y ya está visible para los estudiantes.`,
          propertyId: id,
          propertyTitle: property.title,
          read: false,
          createdAt: new Date().toISOString()
        };

        parsedNotifications.unshift(newNotification);
        localStorage.setItem('estuarriendo_notifications', JSON.stringify(parsedNotifications));
      }

      return true;
    }
    return false;
  },
'@

$newApprove = @'
  async approveProperty(id: string): Promise<boolean> {
    try {
      console.log(`🔄 Approving property/unit ID: ${id}`);
      const response = await apiClient.put(`/properties/${id}/approve`);
      console.log('✅ Property approved:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Error approving property:', error);
      console.error('  - Response:', error.response?.data);
      console.error('  - Status:', error.response?.status);
      return false;
    }
  },
'@

# Replace rejectProperty function  
$oldReject = @'
  async rejectProperty(id: string, reason: string): Promise<boolean> {
    await delay(500);
    const properties = getStoredProperties();
    const index = properties.findIndex(p => p.id === id);
    if (index !== -1) {
      properties[index].status = 'rejected';
      properties[index].rejectionReason = reason;
      saveProperties(properties);

      // Create notification for owner
      const ownerId = properties[index].ownerId;
      if (ownerId) {
        const notifications = localStorage.getItem('estuarriendo_notifications');
        let parsedNotifications: Notification[] = [];
        if (notifications) {
          try {
            parsedNotifications = JSON.parse(notifications);
          } catch (e) {
            console.error('Error parsing notifications', e);
          }
        }

        const newNotification: Notification = {
          id: Date.now().toString(),
          userId: ownerId,
          type: 'property_rejected',
          title: 'Propiedad Rechazada',
          message: `Tu propiedad \"${properties[index].title}\" ha sido rechazada. Razón: ${reason}`,
          propertyId: id,
          propertyTitle: properties[index].title,
          read: false,
          createdAt: new Date().toISOString()
        };

        parsedNotifications.unshift(newNotification);
        localStorage.setItem('estuarriendo_notifications', JSON.stringify(parsedNotifications));
      }

      return true;
    }
    return false;
  },
'@

$newReject = @'
  async rejectProperty(id: string, reason: string): Promise<boolean> {
    try {
      console.log(`🚫 Rejecting property/unit ID: ${id}, Reason: ${reason}`);
      const response = await apiClient.put(`/properties/${id}/reject`, { reason });
      console.log('✅ Property rejected:', response.data);
      return true;
    } catch (error: any) {
      console.error('❌ Error rejecting property:', error);
      console.error('  - Response:', error.response?.data);
      console.error('  - Status:', error.response?.status);
      return false;
    }
  },
'@

$content = $content -replace [regex]::Escape($oldApprove), $newApprove
$content = $content -replace [regex]::Escape($oldReject), $newReject

Set-Content $filePath -Value $content -Encoding UTF8 -NoNewline
Write-Host "✅ api.ts updated successfully!"
