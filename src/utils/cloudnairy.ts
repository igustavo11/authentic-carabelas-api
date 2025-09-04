import { v2 as cloudinary } from 'cloudinary';

// Configuração do Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export class CloudinaryService {
  /**
   * Upload de uma imagem para o Cloudinary
   * @param file - Buffer ou string base64 da imagem
   * @param folder - Pasta onde a imagem será salva (opcional)
   * @param publicId - ID público personalizado (opcional)
   * @returns Promise com a URL da imagem e informações do upload
   */
  static async uploadImage(
    file: Buffer | string,
    folder: string = 'products',
    publicId?: string
  ): Promise<{
    url: string;
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
  }> {
    try {
      const uploadOptions: any = {
        folder,
        resource_type: 'image',
        quality: 'auto',
        fetch_format: 'auto',
      };

      if (publicId) {
        uploadOptions.public_id = publicId;
      }

      const result = await cloudinary.uploader.upload(
        typeof file === 'string' ? file : `data:image/jpeg;base64,${file.toString('base64')}`, 
        uploadOptions
      );
      
      return {
        url: result.url,
        public_id: result.public_id,
        secure_url: result.secure_url,
        width: result.width,
        height: result.height,
      };
    } catch (error) {
      console.error('Erro no upload para Cloudinary:', error);
      throw new Error('Falha no upload da imagem');
    }
  }

  /**
   * Upload de múltiplas imagens
   * @param files - Array de buffers ou strings base64
   * @param folder - Pasta onde as imagens serão salvas
   * @returns Promise com array de URLs das imagens
   */
  static async uploadMultipleImages(
    files: (Buffer | string)[],
    folder: string = 'products'
  ): Promise<Array<{
    url: string;
    public_id: string;
    secure_url: string;
    width: number;
    height: number;
  }>> {
    try {
      const uploadPromises = files.map((file, index) => 
        this.uploadImage(file, folder, `product_${Date.now()}_${index}`)
      );

      const results = await Promise.all(uploadPromises);
      return results;
    } catch (error) {
      console.error('Erro no upload múltiplo para Cloudinary:', error);
      throw new Error('Falha no upload das imagens');
    }
  }

  /**
   * Deletar uma imagem do Cloudinary
   * @param publicId - ID público da imagem
   * @returns Promise com resultado da deleção
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Erro ao deletar imagem do Cloudinary:', error);
      return false;
    }
  }

  /**
   * Gerar URL de transformação para otimização de imagens
   * @param publicId - ID público da imagem
   * @param options - Opções de transformação
   * @returns URL otimizada da imagem
   */
  static getOptimizedImageUrl(
    publicId: string,
    options: {
      width?: number;
      height?: number;
      quality?: string | number;
      format?: string;
      crop?: string;
    } = {}
  ): string {
    const defaultOptions = {
      quality: 'auto',
      fetch_format: 'auto',
      ...options,
    };

    return cloudinary.url(publicId, defaultOptions);
  }

  /**
   * Converter arquivo para base64
   * @param file - Buffer do arquivo
   * @returns String base64
   */
  static bufferToBase64(file: Buffer): string {
    return `data:image/jpeg;base64,${file.toString('base64')}`;
  }

  /**
   * Extrair public_id de uma URL do Cloudinary
   * @param url - URL da imagem no Cloudinary
   * @returns public_id extraído
   */
  static extractPublicId(url: string): string | null {
    try {
      const match = url.match(/\/v\d+\/(.+)\.(jpg|jpeg|png|gif|webp)$/);
      return match?.[1] ?? null;
    } catch (error) {
      console.error('Erro ao extrair public_id:', error);
      return null;
    }
  }
}

export default CloudinaryService;
