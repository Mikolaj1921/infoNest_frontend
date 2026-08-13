'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { documentService } from '@/services/document.service';
import { toast } from 'sonner';
import { useRouter, useParams } from 'next/navigation';
import { DocumentVisibility } from '@/types/document';

// ua: хук для створення нового документа всередині папки
export const useCreateDocument = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();
  const workspaceId = typeof params?.id === 'string' ? params.id : '';

  return useMutation({
    mutationFn: ({
      categoryId,
      title,
    }: {
      categoryId: string;
      title: string;
    }) =>
      documentService.createDocument(categoryId, {
        title,
        categoryId, // передаємо id папки в dto
        content: '<h1>New Document</h1><p>Start writing here...</p>', // дефолтна структура контенту
        visibility: DocumentVisibility.PRIVATE, // по дефолту прив
      }),
    onSuccess: (newDoc) => {
      toast.success('Document created successfully');

      // ресет кешу структури, щоб новий документ моментально зявився в NavTree
      queryClient.invalidateQueries({
        queryKey: ['workspace-structure', workspaceId],
      });

      // автодірект - якщо юзер створив новий документ, то його одразу відкриваємо
      router.push(`/workspaces/${workspaceId}/documents/${newDoc.id}`);
    },
    onError: () => {
      toast.error('Failed to create document. Please try again.');
    },
  });
};

// ua: хук для безпечного видалення документа
export const useDeleteDocument = () => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const params = useParams();

  const workspaceId = typeof params?.id === 'string' ? params.id : '';
  const activeDocId = typeof params?.docId === 'string' ? params.docId : '';

  return useMutation({
    mutationFn: (documentId: string) =>
      documentService.deleteDocument(documentId),
    onSuccess: (_, deletedDocId) => {
      toast.success('Document deleted successfully');

      // апдейт дерева документів у сайдбарі
      queryClient.invalidateQueries({
        queryKey: ['workspace-structure', workspaceId],
      });

      // якщо юзер видалив саме той документ в якому він перебував — на мейн пейдж воркспейсу
      if (activeDocId === deletedDocId) {
        router.push(`/workspaces/${workspaceId}`);
      }
    },
    onError: () => {
      toast.error('Failed to delete document');
    },
  });
};
